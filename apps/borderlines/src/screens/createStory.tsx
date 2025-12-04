import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { MediaType } from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

import { COUNTRY_OPTIONS } from '@/data/countryOptions';
import { palette, theme } from '@/theme';
import { storyApiClient, StoryImageUpload, useStoryStore } from '@/modules/story';
import type { CategoryKey, FieldKey, FormState } from './createStory.types';

type FormErrors = Partial<Record<FieldKey, string>>;

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

type FormFieldProps = {
  label: string;
  helper?: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
};

type PendingLibraryImage = {
  id: string;
  fileName: string;
  contentType: string;
  data: string;
  uri?: string;
  compressionStep: number;
};

type ManualImageEntry = {
  index: number;
  value: string;
};

type PreviewImage = {
  id: string;
  uri: string;
  source: 'library' | 'manual';
  manualIndex?: number;
};

const createDefaultFormState = (): FormState => ({
  title: '',
  subtitle: '',
  email: '',
  category: 'law',
  countryTag: '',
  routeTag: '',
  summary: '',
  keyDetails: '',
  meaning: '',
  imageUrls: '',
  shareAnonymously: false,
  isSpotlight: false,
});

const STEPS = ['Story basics', 'Story details', 'Media & submit'] as const;

const STEP_FIELD_KEYS: Record<number, FieldKey[]> = {
  0: ['title', 'subtitle', 'email'],
  1: ['summary', 'keyDetails', 'meaning'],
  2: [],
};

const IMAGE_PROCESSING_ERROR = 'IMAGE_PROCESSING_ERROR';

const guessContentTypeFromName = (fileName?: string | null, fallback = 'image/jpeg'): string => {
  if (!fileName) {
    return fallback;
  }
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.heic')) {
    return 'image/heic';
  }
  return fallback;
};

const extensionFromMime = (mime: string): string => {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
};

const ensureFileNameHasExtension = (fileName: string, contentType: string): string => {
  if (!fileName) {
    const extension = extensionFromMime(contentType);
    return `image.${extension}`;
  }
  if (/\.[a-z0-9]+$/i.test(fileName)) {
    return fileName;
  }
  const extension = extensionFromMime(contentType);
  return `${fileName}.${extension}`;
};

const buildPreviewUri = (value: string, contentType = 'image/png'): string => {
  if (value.startsWith('data:')) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `data:${contentType};base64,${value}`;
};

const sanitizeBase64 = (value: string): string => value.replace(/\s/g, '');

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value.trim());

const parseDataUrl = (
  value: string
): { contentType: string; data: string } | null => {
  const match = value.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { contentType: match[1], data: match[2] };
};

const getFileNameFromUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.pop() ?? null;
  } catch (error) {
    return null;
  }
};

const uniqueId = (): string => `img-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const ensureLocalImageUri = async (
  uri: string | undefined,
  base64Data: string,
  contentType: string
): Promise<string> => {
  if (uri) {
    return uri;
  }

  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    throw new Error(IMAGE_PROCESSING_ERROR);
  }

  const extension = extensionFromMime(contentType);
  const tempPath = `${baseDirectory}story-image-${uniqueId()}.${extension}`;

  try {
    await FileSystem.writeAsStringAsync(tempPath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return tempPath;
  } catch (error) {
    console.warn('Failed to persist image for compression', error);
    throw new Error(IMAGE_PROCESSING_ERROR);
  }
};

const MAX_IMAGE_SIZE_BYTES = 520_000;
const MAX_TOTAL_IMAGE_PAYLOAD_BYTES = 1_000_000_000;
const MAX_LIBRARY_IMAGE_COUNT = 3;
const IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE';
const PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE';

const COMPRESSION_ATTEMPTS: { maxWidth: number; compress: number }[] = [
  { maxWidth: 1480, compress: 0.55 },
  { maxWidth: 1280, compress: 0.44 },
  { maxWidth: 1040, compress: 0.34 },
  { maxWidth: 820, compress: 0.26 },
  { maxWidth: 640, compress: 0.2 },
  { maxWidth: 520, compress: 0.16 },
  { maxWidth: 420, compress: 0.12 },
  { maxWidth: 320, compress: 0.1 },
  { maxWidth: 240, compress: 0.08 },
];

const getBase64ByteSize = (value: string): number => {
  if (!value) {
    return 0;
  }
  return Math.ceil(value.length * 3 / 4);
};

const calculatePayloadBytes = (images: Array<{ data: string }>): number =>
  images.reduce((sum, image) => sum + getBase64ByteSize(image.data), 0);

const calculatePendingBytes = (images: PendingLibraryImage[]): number =>
  images.reduce((sum, image) => sum + getBase64ByteSize(image.data), 0);

const canFurtherCompress = (image: PendingLibraryImage): boolean =>
  Boolean(image.uri) && image.compressionStep < COMPRESSION_ATTEMPTS.length - 1;

const formatBytesToMb = (bytes: number): string => (bytes / 1_000_000).toFixed(1);

const ensureBase64WithinLimit = (value: string) => {
  if (getBase64ByteSize(value) > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(IMAGE_TOO_LARGE);
  }
};

type ProcessedLibraryImage = {
  base64: string;
  contentType: string;
  uri?: string;
  compressionStep: number;
};

const compressLibraryAssetIfNeeded = async (
  uri: string | undefined,
  base64Data: string,
  requestedContentType: string
): Promise<ProcessedLibraryImage> => {
  let sanitized = sanitizeBase64(base64Data);
  let contentType = requestedContentType;
  let compressionStep = -1;

  const initialUri = await ensureLocalImageUri(uri, sanitized, contentType);
  let workingUri = initialUri;

  if (getBase64ByteSize(sanitized) <= MAX_IMAGE_SIZE_BYTES) {
    return { base64: sanitized, contentType, uri: workingUri, compressionStep };
  }

  for (let index = 0; index < COMPRESSION_ATTEMPTS.length; index += 1) {
    const attempt = COMPRESSION_ATTEMPTS[index];
    try {
      const result = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ resize: { width: attempt.maxWidth } }],
        {
          compress: attempt.compress,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!result.base64) {
        continue;
      }

      sanitized = sanitizeBase64(result.base64);
      workingUri = result.uri;
      contentType = 'image/jpeg';
      compressionStep = index;

      if (getBase64ByteSize(sanitized) <= MAX_IMAGE_SIZE_BYTES) {
        return { base64: sanitized, contentType, uri: workingUri, compressionStep };
      }
    } catch (error) {
      console.warn('Failed to compress image', error);
      break;
    }
  }

  const fallbackPlans: { maxWidth: number; compress: number }[] = [
    { maxWidth: 220, compress: 0.08 },
    { maxWidth: 180, compress: 0.07 },
    { maxWidth: 160, compress: 0.06 },
    { maxWidth: 140, compress: 0.05 },
    { maxWidth: 120, compress: 0.05 },
    { maxWidth: 100, compress: 0.04 },
    { maxWidth: 80, compress: 0.035 },
  ];

  for (const plan of fallbackPlans) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        workingUri,
        [{ resize: { width: plan.maxWidth } }],
        {
          compress: plan.compress,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!result.base64) {
        continue;
      }

      sanitized = sanitizeBase64(result.base64);
      workingUri = result.uri;
      contentType = 'image/jpeg';
      compressionStep = COMPRESSION_ATTEMPTS.length - 1;

      if (getBase64ByteSize(sanitized) <= MAX_IMAGE_SIZE_BYTES) {
        return { base64: sanitized, contentType, uri: workingUri, compressionStep };
      }
    } catch (error) {
      console.warn('Failed to apply fallback compression', error);
    }
  }

  throw new Error(IMAGE_TOO_LARGE);
};

const reduceLibraryPayloadToFitBudget = async (
  images: PendingLibraryImage[],
  manualUploads: StoryImageUpload[],
  budgetBytes: number
): Promise<PendingLibraryImage[]> => {
  const manualBytes = calculatePayloadBytes(manualUploads);
  let workingImages = images.map((image) => ({ ...image }));
  let totalBytes = manualBytes + calculatePendingBytes(workingImages);

  if (totalBytes <= budgetBytes) {
    return workingImages;
  }

  while (totalBytes > budgetBytes) {
    const candidate = workingImages
      .map((image, index) => ({ image, index }))
      .filter(({ image }) => canFurtherCompress(image))
      .sort((a, b) => getBase64ByteSize(b.image.data) - getBase64ByteSize(a.image.data))[0];

    if (!candidate) {
      throw new Error(PAYLOAD_TOO_LARGE);
    }

    const nextStep = candidate.image.compressionStep + 1;
    const attempt = COMPRESSION_ATTEMPTS[nextStep];

    try {
      const result = await ImageManipulator.manipulateAsync(
        candidate.image.uri!,
        [{ resize: { width: attempt.maxWidth } }],
        {
          compress: attempt.compress,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!result.base64) {
        workingImages[candidate.index] = {
          ...candidate.image,
          compressionStep: COMPRESSION_ATTEMPTS.length - 1,
        };
        continue;
      }

      const sanitized = sanitizeBase64(result.base64);

      workingImages[candidate.index] = {
        ...candidate.image,
        data: sanitized,
        contentType: 'image/jpeg',
        uri: result.uri,
        compressionStep: nextStep,
      };

      totalBytes = manualBytes + calculatePendingBytes(workingImages);
    } catch (error) {
      console.warn('Failed to compress image during payload reduction', error);
      workingImages[candidate.index] = {
        ...candidate.image,
        compressionStep: COMPRESSION_ATTEMPTS.length - 1,
      };
    }
  }

  return workingImages;
};

const FormSection = ({ title, description, children }: FormSectionProps) => (
  <View style={styles.formSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {description ? <Text style={styles.sectionSubtitle}>{description}</Text> : null}
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const FormField = ({ label, helper, optional, error, children }: FormFieldProps) => (
  <View style={styles.formField}>
    <View style={styles.fieldHeaderRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {optional ? <Text style={styles.optionalTag}>Optional</Text> : null}
    </View>
    {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
    {children}
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const CreateStoryScreen = () => {
  const navigation = useNavigation();
  const loadStories = useStoryStore((state) => state.loadStories);
  const activeParams = useStoryStore((state) => state.activeParams);
  const hasLoaded = useStoryStore((state) => state.hasLoaded);
  const countryOptions = useStoryStore((state) => state.countryOptions);
  const routeOptions = useStoryStore((state) => state.routeOptions);

  const [form, setForm] = useState<FormState>(() => createDefaultFormState());
  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'category' | 'country' | 'route' | null>(null);
  const [libraryImages, setLibraryImages] = useState<PendingLibraryImage[]>([]);
  const [lastNamedSubtitle, setLastNamedSubtitle] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasLoaded) {
      useStoryStore
        .getState()
        .loadStories(undefined, { refresh: false })
        .catch(() => {});
    }
  }, [hasLoaded]);

  const normalizedCountryOptions = useMemo(() => {
    const base = countryOptions.length > 0 ? countryOptions : Array.from(COUNTRY_OPTIONS);
    const unique = new Set<string>();
    base.forEach((option: string) => {
      if (option && option.trim().length > 0) {
        unique.add(option.trim());
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [countryOptions]);

  const normalizedRouteOptions = useMemo(() => {
    const unique = new Set<string>();
    routeOptions.forEach((option: string) => {
      if (option && option.trim().length > 0) {
        unique.add(option.trim());
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [routeOptions]);

  const filteredCountries = useMemo(
    () =>
      storyApiClient.searchCountries(form.countryTag, {
        limit: 24,
        sourceOptions: normalizedCountryOptions,
      }),
    [form.countryTag, normalizedCountryOptions]
  );

  const filteredRoutes = useMemo(
    () =>
      storyApiClient.searchRoutes(form.routeTag, {
        limit: 24,
        sourceOptions: normalizedRouteOptions,
      }),
    [form.routeTag, normalizedRouteOptions]
  );

  const manualImageEntries = useMemo<ManualImageEntry[]>(() => {
    const lines = form.imageUrls.split('\n');
    return lines
      .map((line, index) => ({ index, value: line.trim() }))
      .filter((entry) => entry.value.length > 0);
  }, [form.imageUrls]);

  const previewImages = useMemo<PreviewImage[]>(() => {
    const manualPreviews: PreviewImage[] = manualImageEntries.map((entry, position) => ({
      id: `manual-${position}`,
      uri: buildPreviewUri(entry.value),
      source: 'manual',
      manualIndex: entry.index,
    }));

    const libraryPreviews: PreviewImage[] = libraryImages.map((image) => ({
      id: image.id,
      uri: image.uri ? image.uri : buildPreviewUri(image.data, image.contentType),
      source: 'library',
    }));

    return [...libraryPreviews, ...manualPreviews];
  }, [libraryImages, manualImageEntries]);

  const stepHasErrors = (stepIndex: number) => {
    const keys = STEP_FIELD_KEYS[stepIndex] ?? [];
    return keys.some((key) => Boolean(errors[key]));
  };

  const getInputStyles = (field: FieldKey, options: { multiline?: boolean; disabled?: boolean } = {}) => [
    styles.input,
    options.multiline && styles.textArea,
    focusedField === field && styles.inputFocused,
    errors[field] && styles.inputError,
    options.disabled && styles.inputDisabled,
  ];

  const getSelectStyles = (isActive: boolean) => [
    styles.select,
    isActive && styles.inputFocused,
  ];

  const selectedCategory = CATEGORY_OPTIONS.find((option) => option.key === form.category);
  const totalSteps = STEPS.length;
  const isFinalStep = currentStep === totalSteps - 1;
  const progressFraction = (currentStep + 1) / totalSteps;

  const handleChange = <K extends FieldKey>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (key === 'subtitle' && typeof value === 'string' && !form.shareAnonymously) {
      setLastNamedSubtitle(value);
    }
    setSubmitError(null);
  };

  const handleTextFocus = (field: FieldKey) => {
    setFocusedField(field);
    if (field !== 'countryTag' && field !== 'routeTag') {
      setActiveDropdown(null);
    }
  };

  const handleTextBlur = (field: FieldKey) => {
    setFocusedField((current) => (current === field ? null : current));
  };

  const toggleAnonymous = (value: boolean) => {
    setSubmitError(null);
    setActiveDropdown(null);

    if (value) {
      setLastNamedSubtitle(form.subtitle);
      setForm((prev) => ({
        ...prev,
        shareAnonymously: true,
        subtitle: 'Anonymous contributor',
      }));
      setErrors((prev) => {
        if (!prev.subtitle) {
          return prev;
        }
        const next = { ...prev };
        delete next.subtitle;
        return next;
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      shareAnonymously: false,
      subtitle: lastNamedSubtitle,
    }));
  };

  const handleSelectCategory = (category: CategoryKey) => {
    setSubmitError(null);
    handleChange('category', category);
    setActiveDropdown(null);
  };

  const handleSelectCountry = (country?: string) => {
    setSubmitError(null);
    handleChange('countryTag', country ?? '');
    setActiveDropdown(null);
    setFocusedField(null);
  };

  const handleSelectRoute = (route?: string) => {
    setSubmitError(null);
    handleChange('routeTag', route ?? '');
    setActiveDropdown(null);
    setFocusedField(null);
  };

  const handleRemoveManualImage = (lineIndex?: number) => {
    if (lineIndex === undefined) {
      return;
    }
    setForm((prev) => {
      const lines = prev.imageUrls.split('\n');
      if (lineIndex < 0 || lineIndex >= lines.length) {
        return prev;
      }
      lines.splice(lineIndex, 1);
      return { ...prev, imageUrls: lines.join('\n') };
    });
  };

  const handleRemoveLibraryImage = (id: string) => {
    setLibraryImages((prev) => prev.filter((image) => image.id !== id));
  };

  const handleRemovePreviewImage = (image: PreviewImage) => {
    if (image.source === 'library') {
      handleRemoveLibraryImage(image.id);
    } else {
      handleRemoveManualImage(image.manualIndex);
    }
  };

  const handleAddImageFromLibrary = async () => {
    setSubmitError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'We need access to your photo library so you can attach images to your story.'
      );
      return;
    }

    if (libraryImages.length >= MAX_LIBRARY_IMAGE_COUNT) {
      Alert.alert(
        'Image limit reached',
        `You can attach up to ${MAX_LIBRARY_IMAGE_COUNT} images per story. Remove one before adding another.`
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as MediaType[],
      quality: 0.25,
      allowsMultipleSelection: true,
      selectionLimit: MAX_LIBRARY_IMAGE_COUNT,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    if (result.assets.length > MAX_LIBRARY_IMAGE_COUNT) {
      Alert.alert(
        'Too many images',
        `Attach up to ${MAX_LIBRARY_IMAGE_COUNT} images per story so we can review quicker.`
      );
      return;
    }

    if (libraryImages.length + result.assets.length > MAX_LIBRARY_IMAGE_COUNT) {
      Alert.alert(
        'Image limit reached',
        `Attach up to ${MAX_LIBRARY_IMAGE_COUNT} images per story. Remove one before adding another.`
      );
      return;
    }

    const nextImages: PendingLibraryImage[] = [];
    const oversizedFiles: string[] = [];

    for (const asset of result.assets) {
      const fallbackType = asset.mimeType ?? 'image/jpeg';
      const inferredType = guessContentTypeFromName(asset.fileName, fallbackType);
      const fileName = ensureFileNameHasExtension(
        asset.fileName ?? `library-image-${uniqueId()}`,
        inferredType
      );
      const contentType = guessContentTypeFromName(fileName, fallbackType);

      let base64Data = asset.base64 ?? '';
      if (!base64Data && asset.uri) {
        try {
          base64Data = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (error) {
          console.warn('Failed to read image from library', error);
          continue;
        }
      }

      if (!base64Data) {
        continue;
      }
      try {
        const processed = await compressLibraryAssetIfNeeded(asset.uri, base64Data, contentType);

        nextImages.push({
          id: uniqueId(),
          fileName,
          contentType: processed.contentType,
          data: processed.base64,
          uri: processed.uri,
          compressionStep: processed.compressionStep,
        });
      } catch (error) {
        if (error instanceof Error && error.message === IMAGE_TOO_LARGE) {
          oversizedFiles.push(fileName);
        } else {
          console.warn('Failed to prepare image for upload', error);
        }
      }
    }

    if (nextImages.length === 0) {
      if (oversizedFiles.length > 0) {
        Alert.alert(
          'Images too large',
          `We could not add ${oversizedFiles.length} image${oversizedFiles.length > 1 ? 's' : ''} because the files were larger than ${formatBytesToMb(MAX_IMAGE_SIZE_BYTES)} MB each. Try compressing them before uploading.`
        );
      }
      return;
    }

    setLibraryImages((prev) => [...prev, ...nextImages]);

    if (oversizedFiles.length > 0) {
      Alert.alert(
        'Some images skipped',
        `We skipped ${oversizedFiles.length} image${oversizedFiles.length > 1 ? 's' : ''} because they were larger than ${formatBytesToMb(MAX_IMAGE_SIZE_BYTES)} MB after compression.`
      );
    }
  };

  const applyStepErrors = (stepIndex: number, stepErrors: FormErrors) => {
    const relevantKeys = STEP_FIELD_KEYS[stepIndex] ?? [];
    setErrors((prev) => {
      const next = { ...prev };
      relevantKeys.forEach((key) => {
        if (next[key]) {
          delete next[key];
        }
      });
      if (Object.keys(stepErrors).length > 0) {
        return { ...next, ...stepErrors };
      }
      return next;
    });
  };

  const validateStep = (stepIndex: number, showAlert = false): boolean => {
    const stepErrors: FormErrors = {};

    if (stepIndex === 0) {
      if (!form.title.trim()) {
        stepErrors.title = 'Add a short headline so readers know what changed.';
      }
      if (!form.shareAnonymously && !form.subtitle.trim()) {
        stepErrors.subtitle = 'Tell readers who is sharing this story.';
      }
      const emailValue = form.email.trim();
      if (!emailValue) {
        stepErrors.email = 'Add an email so we can follow up if needed.';
      } else if (!EMAIL_REGEX.test(emailValue)) {
        stepErrors.email = 'Enter a valid email address (e.g. name@example.com).';
      }
    }

    if (stepIndex === 1) {
      if (!form.summary.trim()) {
        stepErrors.summary = 'Summaries help people decide if this applies to them.';
      }
      if (!form.keyDetails.trim()) {
        stepErrors.keyDetails = 'Share the evidence, steps, or timeline that shaped the result.';
      }
      if (!form.meaning.trim()) {
        stepErrors.meaning = 'Let others know the impact or lessons you would pass on.';
      }
    }

    applyStepErrors(stepIndex, stepErrors);

    const hasErrors = Object.keys(stepErrors).length > 0;
    if (hasErrors && showAlert) {
      Alert.alert('Almost there', 'Review the highlighted fields to continue.');
    }
    return !hasErrors;
  };

  const validateAllSteps = (): boolean => {
    let firstInvalid: number | null = null;
    for (let index = 0; index < STEPS.length; index += 1) {
      const isValid = validateStep(index, false);
      if (!isValid && firstInvalid === null) {
        firstInvalid = index;
      }
    }

    if (firstInvalid !== null) {
      setCurrentStep(firstInvalid);
      Alert.alert('Almost there', 'Review the highlighted fields before submitting.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (isSubmitting) {
      return;
    }
    setSubmitError(null);
    if (!validateStep(currentStep, true)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    setActiveDropdown(null);
    setFocusedField(null);
  };

  const handleBack = () => {
    if (isSubmitting) {
      return;
    }
    setSubmitError(null);
    setActiveDropdown(null);
    setFocusedField(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const convertManualImage = async (value: string, order: number): Promise<StoryImageUpload> => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error(IMAGE_PROCESSING_ERROR);
    }

    if (trimmed.startsWith('data:')) {
      const parsed = parseDataUrl(trimmed);
      if (!parsed) {
        throw new Error(IMAGE_PROCESSING_ERROR);
      }
      const contentType = parsed.contentType || 'image/png';
      const sanitized = sanitizeBase64(parsed.data);
      ensureBase64WithinLimit(sanitized);
      return {
        fileName: ensureFileNameHasExtension(`manual-image-${order + 1}`, contentType),
        contentType,
        data: sanitized,
      };
    }

    if (isHttpUrl(trimmed)) {
      const tempFile = `${FileSystem.cacheDirectory}story-upload-${Date.now()}-${order}`;
      let downloadUri: string | null = null;
      try {
        const downloadResult = await FileSystem.downloadAsync(trimmed, tempFile);
        downloadUri = downloadResult.uri;
        const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const fileNameFromUrl = getFileNameFromUrl(trimmed);
        const contentType = guessContentTypeFromName(fileNameFromUrl, 'image/jpeg');
        const sanitized = sanitizeBase64(base64);
        const processed = await compressLibraryAssetIfNeeded(
          downloadResult.uri,
          sanitized,
          contentType
        );
        return {
          fileName: ensureFileNameHasExtension(
            fileNameFromUrl ?? `remote-image-${order + 1}`,
            processed.contentType
          ),
          contentType: processed.contentType,
          data: processed.base64,
        };
      } catch (error) {
        console.warn('Failed to process remote image', trimmed, error);
        if (error instanceof Error && error.message === IMAGE_TOO_LARGE) {
          throw error;
        }
        throw new Error(IMAGE_PROCESSING_ERROR);
      } finally {
        if (downloadUri) {
          FileSystem.deleteAsync(downloadUri, { idempotent: true }).catch(() => {});
        }
      }
    }

    const contentType = guessContentTypeFromName(undefined, 'image/png');
    const sanitized = sanitizeBase64(trimmed);
    ensureBase64WithinLimit(sanitized);
    return {
      fileName: ensureFileNameHasExtension(`manual-image-${order + 1}`, contentType),
      contentType,
      data: sanitized,
    };
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);

    if (!validateAllSteps()) {
      return;
    }

    setIsSubmitting(true);

    let manualUploads: StoryImageUpload[] = [];
    try {
      manualUploads = await Promise.all(
        manualImageEntries.map((entry, index) => convertManualImage(entry.value, index))
      );
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof Error && error.message === IMAGE_PROCESSING_ERROR) {
        setSubmitError('Unable to process one or more images. Please check the links or base64 data.');
      } else if (error instanceof Error && error.message === IMAGE_TOO_LARGE) {
        setSubmitError(
          `One or more images are larger than ${formatBytesToMb(MAX_IMAGE_SIZE_BYTES)} MB after compression. Please compress or remove them and try again.`
        );
      } else {
        setSubmitError('Something went wrong while preparing your images. Please try again.');
      }
      return;
    }

    const manualBytes = calculatePayloadBytes(manualUploads);
    let optimizedLibraryImages: PendingLibraryImage[] = libraryImages;

    try {
      optimizedLibraryImages = await reduceLibraryPayloadToFitBudget(
        libraryImages,
        manualUploads,
        MAX_TOTAL_IMAGE_PAYLOAD_BYTES
      );
      setLibraryImages(optimizedLibraryImages);
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof Error && error.message === PAYLOAD_TOO_LARGE) {
        setSubmitError(
          `Your submission is still larger than ${formatBytesToMb(
            MAX_TOTAL_IMAGE_PAYLOAD_BYTES
          )} MB. Remove or replace an image, then try again.`
        );
      } else {
        setSubmitError(
          'We could not compress your images enough to meet the upload limit. Please try again.'
        );
      }
      return;
    }

    const payloadImages: StoryImageUpload[] = [
      ...optimizedLibraryImages.map((image) => ({
        fileName: image.fileName,
        contentType: image.contentType,
        data: image.data,
      })),
      ...manualUploads,
    ];

    const totalPayloadBytes = manualBytes + calculatePendingBytes(optimizedLibraryImages);
    if (totalPayloadBytes > MAX_TOTAL_IMAGE_PAYLOAD_BYTES) {
      setIsSubmitting(false);
      setSubmitError(
        `Your images total ${formatBytesToMb(totalPayloadBytes)} MB. Keep uploads under ${formatBytesToMb(MAX_TOTAL_IMAGE_PAYLOAD_BYTES)} MB combined and try again.`
      );
      return;
    }

    try {
      await storyApiClient.createStory({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        category: form.category,
        summary: form.summary.trim(),
        keyDetails: form.keyDetails.trim(),
        meaning: form.meaning.trim(),
        countryTag: form.countryTag.trim() || null,
        routeTag: form.routeTag.trim() || null,
        isSpotlight: form.isSpotlight,
        likes: 0,
        images: payloadImages,
      });

      await loadStories(activeParams, { refresh: true }).catch(() => {});

      Alert.alert(
        'Story submitted for review',
        'Thanks for sharing. Our team will review your story shortly and follow up if anything needs refining.'
      );

      setForm(createDefaultFormState());
      setLibraryImages([]);
      setLastNamedSubtitle('');
      setActiveDropdown(null);
      setFocusedField(null);
      setCurrentStep(0);
    } catch (error) {
      console.warn('Failed to submit story', error);
      if (axios.isAxiosError(error) && error.response?.status === 413) {
        setSubmitError('Your submission is too large. Try removing or compressing some images and submit again.');
      } else {
        setSubmitError('Something went wrong while saving your story. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={navigation.goBack}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={20} color={palette.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Story</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Capture a journey or a policy update using clean, structured form fields.
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setActiveDropdown(null)}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepHeader}>
            <View style={styles.stepLabels}>
              {STEPS.map((label, index) => (
                <View key={label} style={styles.stepLabelWrapper}>
                  <Text
                    style={[
                      styles.stepLabel,
                      stepHasErrors(index) && styles.stepLabelError,
                      index === currentStep && styles.stepLabelActive,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressFraction * 100}%` }]} />
            </View>
          </View>

          {submitError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="warning-outline" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          {currentStep === 0 && (
            <FormSection
              title="Story basics"
              description="Tell people who is sharing and what changed."
            >
              <FormField
                label="Headline"
                helper="Keep it short—what changed or what happened?"
                error={errors.title}
              >
                <TextInput
                  value={form.title}
                  onFocus={() => handleTextFocus('title')}
                  onBlur={() => handleTextBlur('title')}
                  onChangeText={(text) => handleChange('title', text)}
                  placeholder="What is the story about?"
                  placeholderTextColor={palette.textMuted}
                  style={getInputStyles('title')}
                  returnKeyType="next"
                />
              </FormField>

              <FormField
                label="Share anonymously"
                helper="Use this if you prefer readers see ‘Anonymous contributor’."
                optional
              >
                <View style={styles.switchRow}>
                  <Switch
                    value={form.shareAnonymously}
                    onValueChange={toggleAnonymous}
                    trackColor={{ false: '#D1D5DB', true: palette.primary }}
                    thumbColor="#FFFFFF"
                  />
                  <Text style={styles.switchLabel}>
                    {form.shareAnonymously
                      ? 'Your story will be listed as Anonymous contributor.'
                      : 'Readers will see the name you provide below.'}
                  </Text>
                </View>
              </FormField>

              <FormField
                label="Author / Source"
                helper="Name the person or organisation so readers trust the context."
                error={!form.shareAnonymously ? errors.subtitle : undefined}
                optional={form.shareAnonymously}
              >
                <TextInput
                  value={form.subtitle}
                  editable={!form.shareAnonymously}
                  onFocus={() => handleTextFocus('subtitle')}
                  onBlur={() => handleTextBlur('subtitle')}
                  onChangeText={(text) => handleChange('subtitle', text)}
                  placeholder="e.g. Amina · Community Story"
                  placeholderTextColor={palette.textMuted}
                  style={getInputStyles('subtitle', { disabled: form.shareAnonymously })}
                />
              </FormField>

              <FormField
                label="Contact email"
                helper="Only visible to moderators so we can follow up if needed."
                error={errors.email}
              >
                <TextInput
                  value={form.email}
                  onFocus={() => handleTextFocus('email')}
                  onBlur={() => handleTextBlur('email')}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="you@example.com"
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  style={getInputStyles('email')}
                />
              </FormField>

              <FormField
                label="Category"
                helper="Choose whether this is a policy update or lived experience."
              >
                <TouchableOpacity
                  style={getSelectStyles(activeDropdown === 'category')}
                  activeOpacity={0.75}
                  onPress={() =>
                    setActiveDropdown((current) => (current === 'category' ? null : 'category'))
                  }
                >
                  <View style={styles.selectValueRow}>
                    {selectedCategory ? (
                      <Ionicons
                        name={selectedCategory.icon}
                        size={16}
                        color={palette.primary}
                        style={styles.selectIcon}
                      />
                    ) : null}
                    <Text style={styles.selectValue}>
                      {selectedCategory ? selectedCategory.label : 'Select a category'}
                    </Text>
                  </View>
                  <Ionicons
                    name={activeDropdown === 'category' ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={palette.textMuted}
                  />
                </TouchableOpacity>

                {activeDropdown === 'category' ? (
                  <View style={styles.dropdownCard}>
                    {CATEGORY_OPTIONS.map((option) => {
                      const isActive = option.key === form.category;
                      return (
                        <TouchableOpacity
                          key={option.key}
                          style={[styles.dropdownOption, isActive && styles.dropdownOptionActive]}
                          onPress={() => handleSelectCategory(option.key)}
                          activeOpacity={0.75}
                        >
                          <View style={styles.dropdownOptionRow}>
                            <Ionicons
                              name={option.icon}
                              size={16}
                              color={isActive ? palette.primary : palette.textMuted}
                            />
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                isActive && styles.dropdownOptionTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </View>
                          {isActive ? (
                            <Ionicons name="checkmark" size={16} color={palette.primary} />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </FormField>
            </FormSection>
          )}

          {currentStep === 1 && (
            <FormSection
              title="Story details"
              description="Help the right readers discover and understand your experience."
            >
              <FormField
                label="Country tag"
                helper="Start typing to pick a country linked to the story."
              >
                <TextInput
                  value={form.countryTag}
                  onFocus={() => {
                    handleTextFocus('countryTag');
                    setActiveDropdown('country');
                  }}
                  onBlur={() => handleTextBlur('countryTag')}
                  onChangeText={(text) => handleChange('countryTag', text)}
                  placeholder="e.g. UK, Canada"
                  placeholderTextColor={palette.textMuted}
                  style={getInputStyles('countryTag')}
                />
                {activeDropdown === 'country' ? (
                  <View style={styles.dropdownCard}>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => handleSelectCountry('')}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.dropdownOptionText}>All countries</Text>
                    </TouchableOpacity>
                    {filteredCountries.length === 0 ? (
                      <View style={styles.dropdownEmpty}>
                        <Text style={styles.dropdownEmptyText}>No matches found</Text>
                      </View>
                    ) : (
                      <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                        {filteredCountries.map((country) => (
                          <TouchableOpacity
                            key={country}
                            style={[
                              styles.dropdownOption,
                              form.countryTag === country && styles.dropdownOptionActive,
                            ]}
                            onPress={() => handleSelectCountry(country)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                form.countryTag === country && styles.dropdownOptionTextActive,
                              ]}
                            >
                              {country}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                ) : null}
              </FormField>

              <FormField
                label="Route tag"
                helper="Reference the immigration route or programme, if relevant."
                optional
              >
                <TextInput
                  value={form.routeTag}
                  onFocus={() => {
                    handleTextFocus('routeTag');
                    setActiveDropdown('route');
                  }}
                  onBlur={() => handleTextBlur('routeTag')}
                  onChangeText={(text) => handleChange('routeTag', text)}
                  placeholder="e.g. Skilled Worker, Asylum"
                  placeholderTextColor={palette.textMuted}
                  style={getInputStyles('routeTag')}
                />
                {activeDropdown === 'route' ? (
                  <View style={styles.dropdownCard}>
                    <TouchableOpacity
                      style={styles.dropdownOption}
                      onPress={() => handleSelectRoute('')}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.dropdownOptionText}>All routes</Text>
                    </TouchableOpacity>
                    {filteredRoutes.length === 0 ? (
                      <View style={styles.dropdownEmpty}>
                        <Text style={styles.dropdownEmptyText}>No matches found</Text>
                      </View>
                    ) : (
                      <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                        {filteredRoutes.map((route) => (
                          <TouchableOpacity
                            key={route}
                            style={[
                              styles.dropdownOption,
                              form.routeTag === route && styles.dropdownOptionActive,
                            ]}
                            onPress={() => handleSelectRoute(route)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                form.routeTag === route && styles.dropdownOptionTextActive,
                              ]}
                            >
                              {route}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                ) : null}
              </FormField>

              <FormField
                label="Summary"
                helper="A short overview of what changed or the main outcome."
                error={errors.summary}
              >
                <TextInput
                  value={form.summary}
                  onFocus={() => handleTextFocus('summary')}
                  onBlur={() => handleTextBlur('summary')}
                  onChangeText={(text) => handleChange('summary', text)}
                  placeholder="Key points, outcome, lessons..."
                  placeholderTextColor={palette.textMuted}
                  multiline
                  style={getInputStyles('summary', { multiline: true })}
                />
                <Text style={styles.characterCount}>{form.summary.trim().length}/240 suggested</Text>
              </FormField>

              <FormField
                label="Key details"
                helper="Dates, evidence, or steps taken that shaped the result."
                error={errors.keyDetails}
              >
                <TextInput
                  value={form.keyDetails}
                  onFocus={() => handleTextFocus('keyDetails')}
                  onBlur={() => handleTextBlur('keyDetails')}
                  onChangeText={(text) => handleChange('keyDetails', text)}
                  placeholder="Supporting evidence, key steps, timelines..."
                  placeholderTextColor={palette.textMuted}
                  multiline
                  style={getInputStyles('keyDetails', { multiline: true })}
                />
              </FormField>

              <FormField
                label="What this meant"
                helper="Explain the impact and advice for others in a similar situation."
                error={errors.meaning}
              >
                <TextInput
                  value={form.meaning}
                  onFocus={() => handleTextFocus('meaning')}
                  onBlur={() => handleTextBlur('meaning')}
                  onChangeText={(text) => handleChange('meaning', text)}
                  placeholder="Impact, advice for others, next steps..."
                  placeholderTextColor={palette.textMuted}
                  multiline
                  style={getInputStyles('meaning', { multiline: true })}
                />
                <Text style={styles.characterCount}>{form.meaning.trim().length}/280 suggested</Text>
              </FormField>

              <FormField
                label="Spotlight feature"
                helper="Highlight this story at the top of the Discover feed."
                optional
              >
                <View style={styles.switchRow}>
                  <Switch
                    value={form.isSpotlight}
                    onValueChange={(value) => handleChange('isSpotlight', value)}
                    trackColor={{ false: '#D1D5DB', true: palette.primary }}
                    thumbColor="#FFFFFF"
                  />
                  <Text style={styles.switchLabel}>
                    When enabled, editors can feature this as a spotlight story.
                  </Text>
                </View>
              </FormField>
            </FormSection>
          )}

          {currentStep === 2 && (
            <FormSection
              title="Media & submit"
              description="Add supporting media and send your story for review."
            >
              <FormField
                label="Image entries"
                helper="Add one base64 string, data URL, or web image link per line."
                optional
              >
                <TextInput
                  value={form.imageUrls}
                  onFocus={() => handleTextFocus('imageUrls')}
                  onBlur={() => handleTextBlur('imageUrls')}
                  onChangeText={(text) => handleChange('imageUrls', text)}
                  placeholder="Add one image reference per line"
                  placeholderTextColor={palette.textMuted}
                  multiline
                  style={getInputStyles('imageUrls', { multiline: true })}
                />

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleAddImageFromLibrary}
                  activeOpacity={0.85}
                >
                  <Ionicons name="image-outline" size={18} color={palette.primary} />
                  <Text style={styles.uploadButtonText}>Add from device library</Text>
                </TouchableOpacity>

                {previewImages.length > 0 ? (
                  <View style={styles.imageGrid}>
                    {previewImages.map((image) => (
                      <View key={image.id} style={styles.imageThumb}>
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          onPress={() => handleRemovePreviewImage(image)}
                          style={styles.removeImageButton}
                          accessibilityRole="button"
                          accessibilityLabel="Remove image"
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : null}
              </FormField>

              <View style={styles.reviewCard}>
                <View style={styles.reviewIconWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={palette.primary} />
                </View>
                <View style={styles.reviewCopy}>
                  <Text style={styles.reviewTitle}>We review every story</Text>
                  <Text style={styles.reviewBody}>
                    Once you submit, our team checks for safety, accuracy, and tone before it appears on
                    Borderlines.
                  </Text>
                </View>
              </View>
            </FormSection>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (currentStep === 0 || isSubmitting) && styles.secondaryButtonDisabled,
            ]}
            onPress={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            activeOpacity={currentStep === 0 || isSubmitting ? 1 : 0.8}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={currentStep === 0 || isSubmitting ? palette.textMuted : palette.text}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                (currentStep === 0 || isSubmitting) && styles.secondaryButtonTextDisabled,
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
            onPress={isFinalStep ? handleSubmit : handleNext}
            disabled={isSubmitting}
            activeOpacity={isSubmitting ? 1 : 0.9}
          >
            {isFinalStep && isSubmitting ? (
              <View style={styles.primaryButtonContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Submitting...</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>
                {isFinalStep ? 'Submit for review' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CATEGORY_OPTIONS: { key: CategoryKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'law', label: 'Law / Policy', icon: 'scale-outline' },
  { key: 'personal', label: 'Personal Story', icon: 'people-outline' },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F6FB',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  headerTitle: {
    ...theme.typography.subtitle,
    color: palette.text,
  },
  headerSubtitle: {
    marginTop: 6,
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },
  stepHeader: {
    gap: 12,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabelWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  stepLabel: {
    ...theme.typography.caption,
    color: palette.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: palette.text,
    fontWeight: '600',
  },
  stepLabelError: {
    color: '#DC2626',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorBannerText: {
    flex: 1,
    ...theme.typography.caption,
    color: '#B91C1C',
  },
  formSection: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    gap: 16,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: palette.text,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: palette.textMuted,
    lineHeight: 18,
  },
  sectionBody: {
    gap: 18,
  },
  formField: {
    gap: 8,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  optionalTag: {
    ...theme.typography.caption,
    color: palette.textMuted,
    fontStyle: 'italic',
  },
  fieldHelper: {
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D7E3F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...theme.typography.body,
    color: palette.text,
  },
  inputFocused: {
    borderColor: palette.primary,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  inputError: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  inputDisabled: {
    backgroundColor: '#F4F7FB',
    color: palette.textMuted,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  select: {
    borderWidth: 1,
    borderColor: '#D7E3F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectIcon: {
    marginRight: 2,
  },
  selectValue: {
    ...theme.typography.body,
    color: palette.text,
  },
  dropdownCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E3F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownOptionActive: {
    backgroundColor: '#EEF6FF',
  },
  dropdownOptionText: {
    ...theme.typography.body,
    color: palette.text,
  },
  dropdownOptionTextActive: {
    color: palette.primary,
    fontWeight: '600',
  },
  dropdownEmpty: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownEmptyText: {
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D7E3F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchLabel: {
    flex: 1,
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  uploadButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: `${palette.primary}14`,
  },
  uploadButtonText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: palette.primary,
  },
  imageGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageThumb: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EFF4FF',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7E3F0',
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reviewIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${palette.primary}14`,
  },
  reviewCopy: {
    flex: 1,
    gap: 4,
  },
  reviewTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: palette.text,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  reviewBody: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    ...theme.typography.caption,
    color: palette.text,
    fontWeight: '600',
  },
  secondaryButtonTextDisabled: {
    color: palette.textMuted,
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    ...theme.typography.caption,
    color: '#DC2626',
  },
});

export default CreateStoryScreen;
