import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { palette, theme } from '@/theme';
import { COUNTRY_OPTIONS } from '@/data/countryOptions';
import type { CategoryKey, FieldKey, FormState } from './createStory.types';

const CATEGORY_OPTIONS: { key: CategoryKey; label: string }[] = [
  { key: 'law', label: 'Law / Policy' },
  { key: 'personal', label: 'Personal Story' },
];

const ROUTE_OPTIONS = [
  'Skilled Worker',
  'Health and Care Worker',
  'Global Talent',
  'Scale-up Worker',
  'Spouse Visa',
  'Fiancé Visa',
  'Graduate Route',
  'Start-up Visa',
  'Innovator Founder',
  'High Potential Individual',
  'Youth Mobility Scheme',
  'Ancestry Visa',
  '20-year rule',
  '10-year private life',
  'Asylum',
  'Humanitarian Protection',
  'Family Reunification',
  'Express Entry',
  'Provincial Nominee Program',
  'Study Permit',
  'Work Permit',
  'Visitor Visa',
  'Citizenship by Investment',
] as const;

const DEFAULT_IMAGE_URLS = [
  'https://images.pexels.com/photos/4386373/pexels-photo-4386373.jpeg',
  'https://images.pexels.com/photos/7731368/pexels-photo-7731368.jpeg',
].join('\n');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP_FIELD_KEYS: Record<number, FieldKey[]> = {
  0: ['title', 'subtitle', 'email'],
  1: ['summary', 'keyDetails', 'meaning'],
  2: [],
};

const DEFAULT_FORM: FormState = {
  title: 'UK Home Office announces changes to Skilled Worker salary thresholds',
  subtitle: 'UK Home Office',
  email: '',
  category: 'law',
  countryTag: 'UK',
  routeTag: 'Skilled Worker',
  summary:
    'A plain‑English breakdown of the new Skilled Worker salary thresholds and who is most affected by the change.',
  keyDetails:
    'Applies mainly to new Skilled Worker applications submitted after the change. Existing visas may be covered by transitional rules. Salary bands now vary more by occupation and region.',
  meaning:
    'If you are close to the salary threshold, check the updated guidance and consider speaking with a regulated adviser before you submit or vary an application.',
  imageUrls: DEFAULT_IMAGE_URLS,
  shareAnonymously: false,
};

const STEP_LABELS = ['Story basics', 'Details', 'Media & submit'] as const;

const CreateStoryScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [showCountryOptions, setShowCountryOptions] = useState(false);
  const [showRouteOptions, setShowRouteOptions] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [lastNamedSubtitle, setLastNamedSubtitle] = useState(DEFAULT_FORM.subtitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const imageEntries = useMemo(() => {
    return form.imageUrls
      .split('\n')
      .map((uri) => uri.trim())
      .filter(Boolean);
  }, [form.imageUrls]);

  const totalSteps = STEP_LABELS.length;
  const isFinalStep = currentStep === totalSteps - 1;
  const progressFraction = (currentStep + 1) / totalSteps;
  const isPrimaryDisabled = isFinalStep ? isSubmitting : false;
  const primaryButtonLabel = isFinalStep
    ? isSubmitting
      ? 'Submitting...'
      : 'Submit for review'
    : 'Next';
  const previewCategoryLabel = form.category === 'law' ? 'LAW' : 'PERSONAL';
  const previewAccentStyle =
    form.category === 'law' ? styles.previewCardAccentLaw : styles.previewCardAccentPersonal;
  const previewSourceRaw = form.shareAnonymously ? 'Anonymous contributor' : form.subtitle.trim();
  const previewSourceText =
    previewSourceRaw || 'Add a source so readers know who shared this';
  const previewSourceIsPlaceholder = !form.shareAnonymously && !form.subtitle.trim();
  const previewTitleRaw = form.title.trim();
  const previewTitleText = previewTitleRaw || 'Your headline will appear here';
  const previewTitleIsPlaceholder = previewTitleRaw.length === 0;
  const previewSummaryRaw = form.summary.trim();
  const previewSummaryText =
    previewSummaryRaw || 'Use the summary field to give readers the key points.';
  const previewSummaryIsPlaceholder = previewSummaryRaw.length === 0;
  const previewTagLineRaw = [form.countryTag.trim(), form.routeTag.trim()]
    .filter(Boolean)
    .join(' · ');
  const previewTagLineText =
    previewTagLineRaw || 'Add tags so the right people can find this story.';
  const previewTagLineIsPlaceholder = previewTagLineRaw.length === 0;

  const handleChange = <K extends FieldKey>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'subtitle' && typeof value === 'string' && !form.shareAnonymously) {
      setLastNamedSubtitle(value);
    }
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const filteredCountries = useMemo(() => {
    const query = form.countryTag.trim().toLowerCase();
    if (!query) {
      return COUNTRY_OPTIONS.slice(0, 12);
    }
    return COUNTRY_OPTIONS.filter((option) =>
      option.toLowerCase().includes(query)
    ).slice(0, 12);
  }, [form.countryTag]);

  const handleSelectCountry = (country: string) => {
    handleChange('countryTag', country);
    setShowCountryOptions(false);
  };

  const filteredRoutes = useMemo(() => {
    const query = form.routeTag.trim().toLowerCase();
    if (!query) {
      return ROUTE_OPTIONS.slice(0, 12);
    }
    return ROUTE_OPTIONS.filter((option) =>
      option.toLowerCase().includes(query)
    ).slice(0, 12);
  }, [form.routeTag]);

  const handleSelectRoute = (route: string) => {
    handleChange('routeTag', route);
    setShowRouteOptions(false);
  };

  const applyStepErrors = (stepIndex: number, stepErrors: Partial<Record<FieldKey, string>>) => {
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

  const validateStep = (stepIndex: number, showAlert = true) => {
    const stepErrors: Partial<Record<FieldKey, string>> = {};

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
        stepErrors.keyDetails = 'Share the key steps, evidence, or timeline that shaped the result.';
      }
      if (!form.meaning.trim()) {
        stepErrors.meaning = 'Let others know the impact or advice you would share.';
      }
    }

    applyStepErrors(stepIndex, stepErrors);

    const hasErrors = Object.keys(stepErrors).length > 0;
    if (hasErrors && showAlert) {
      Alert.alert('Almost there', 'Review the highlighted fields to continue.');
    }
    return !hasErrors;
  };

  const handleNext = () => {
    setSubmitError(null);
    if (!validateStep(currentStep, true)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);

    let firstInvalidStep: number | null = null;
    STEP_LABELS.forEach((_, index) => {
      const isValid = validateStep(index, firstInvalidStep === null);
      if (!isValid && firstInvalidStep === null) {
        firstInvalidStep = index;
      }
    });

    if (firstInvalidStep !== null) {
      setCurrentStep(firstInvalidStep);
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: replace with API call
      await new Promise((resolve) => setTimeout(resolve, 900));

      Alert.alert(
        'Story submitted for review',
        'Thanks for sharing. Our team will review your story shortly and follow up if anything needs refining.'
      );
    } catch (error) {
      setSubmitError('Something went wrong while saving your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = (uriToRemove: string) => {
    const updated = imageEntries.filter((uri) => uri !== uriToRemove);
    handleChange('imageUrls', updated.join('\n'));
  };

  const handleAddImageFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'We need access to your photo library so you can attach images to your story.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 3,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const nextUris = [...imageEntries];
    result.assets.forEach((asset: ImagePicker.ImagePickerAsset) => {
      if (asset.uri && !nextUris.includes(asset.uri)) {
        nextUris.push(asset.uri);
      }
    });

    handleChange('imageUrls', nextUris.join('\n'));
  };

  const toggleAnonymous = (value: boolean) => {
    setForm((prev) => {
      if (value) {
        setLastNamedSubtitle(prev.subtitle);
        return {
          ...prev,
          shareAnonymously: true,
          subtitle: 'Anonymous contributor',
        };
      }
      return {
        ...prev,
        shareAnonymously: false,
        subtitle: lastNamedSubtitle,
      };
    });
    if (value) {
      setErrors((prev) => {
        if (!prev.subtitle) {
          return prev;
        }
        const next = { ...prev };
        delete next.subtitle;
        return next;
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <View style={styles.topBarHeader}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={navigation.goBack}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={20} color={palette.text} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Create Story</Text>
          </View>
          <Text style={styles.topBarSubtitle}>
            Capture a journey or a policy update to share with the community.
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepHeader}>
            <View style={styles.stepLabels}>
              {STEP_LABELS.map((label, index) => {
                const hasStepError = (STEP_FIELD_KEYS[index] ?? []).some((fieldKey) => Boolean(errors[fieldKey]));
                return (
                  <View key={label} style={styles.stepLabelWrapper}>
                    <Text
                      style={[
                        styles.stepLabel,
                        hasStepError && styles.stepLabelError,
                        index === currentStep && styles.stepLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { flex: progressFraction }]} />
              <View style={{ flex: Math.max(1 - progressFraction, 0) }} />
            </View>
          </View>

          {currentStep === 0 && (
            <View style={styles.stepContent}>
              <View style={styles.guidanceCard}>
                <View style={styles.guidanceIconWrapper}>
                  <Ionicons name="bulb-outline" size={20} color={palette.primary} />
                </View>
                <View style={styles.guidanceCopy}>
                  <Text style={styles.guidanceTitle}>Tips for a clear story</Text>
                  <Text style={styles.guidanceText}>
                    Lead with the headline readers should see, explain who is sharing it, and summarise the outcome in plain language.
                  </Text>
                  <Text style={styles.guidanceText}>
                    Highlight the key steps, evidence, and what you learned so others know what to try next.
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Headline</Text>
                <Text style={styles.fieldHint}>Keep it short—what changed or what happened?</Text>
                <TextInput
                  value={form.title}
                  onChangeText={(text) => handleChange('title', text)}
                  placeholder="What is the story about?"
                  placeholderTextColor={palette.textMuted}
                  style={[styles.input, errors.title && styles.inputError]}
                />
                {errors.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Share anonymously</Text>
                  <Text style={styles.optionalLabel}>Optional</Text>
                </View>
                <Text style={styles.fieldHint}>
                  Switch on if you would prefer readers see “Anonymous contributor” instead of your name.
                </Text>
                <View style={styles.anonymousRow}>
                  <Switch
                    value={form.shareAnonymously}
                    onValueChange={toggleAnonymous}
                    trackColor={{ false: '#D1D5DB', true: palette.primary }}
                    thumbColor="#FFFFFF"
                  />
                  <Text style={styles.anonymousLabel}>
                    {form.shareAnonymously
                      ? 'Your story will be listed as Anonymous contributor.'
                      : 'Readers will see the name you provide below.'}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Author / Source</Text>
                <Text style={styles.fieldHint}>Name the person or organisation so readers trust the context.</Text>
                <TextInput
                  value={form.subtitle}
                  onChangeText={(text) => handleChange('subtitle', text)}
                  placeholder="e.g. Amina · Community Story"
                  placeholderTextColor={palette.textMuted}
                  style={[
                    styles.input,
                    form.shareAnonymously && styles.disabledInput,
                    !form.shareAnonymously && errors.subtitle && styles.inputError,
                  ]}
                  editable={!form.shareAnonymously}
                />
                {!form.shareAnonymously && errors.subtitle && (
                  <Text style={styles.errorText}>{errors.subtitle}</Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Contact email</Text>
                <Text style={styles.fieldHint}>Only visible to moderators so we can follow up if needed.</Text>
                <TextInput
                  value={form.email}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="you@example.com"
                  placeholderTextColor={palette.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  style={[styles.input, errors.email && styles.inputError]}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.fieldHint}>Choose whether this is a policy update or a lived experience.</Text>
                <View style={styles.categoryRow}>
                  {CATEGORY_OPTIONS.map((option) => {
                    const isActive = form.category === option.key;
                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                        onPress={() => handleChange('category', option.key)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={option.key === 'law' ? 'scale-outline' : 'people-outline'}
                          size={16}
                          color={isActive ? '#FFFFFF' : palette.textSubtle}
                          style={styles.categoryIcon}
                        />
                        <Text
                          style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.section}>
                <Text style={styles.label}>Country tag</Text>
                <Text style={styles.fieldHint}>Start typing to pick a country linked to the story.</Text>
                <TextInput
                  value={form.countryTag}
                  onChangeText={(text) => handleChange('countryTag', text)}
                  placeholder="e.g. UK, Canada"
                  placeholderTextColor={palette.textMuted}
                  style={styles.input}
                  onFocus={() => setShowCountryOptions(true)}
                  onBlur={() => setShowCountryOptions(false)}
                />
                {showCountryOptions && (
                  <View style={styles.typeaheadContainer}>
                    {filteredCountries.length === 0 ? (
                      <Text style={styles.typeaheadEmpty}>No matches found</Text>
                    ) : (
                      filteredCountries.map((country) => (
                        <TouchableOpacity
                          key={country}
                          style={styles.typeaheadItem}
                          activeOpacity={0.7}
                          onPress={() => handleSelectCountry(country)}
                        >
                          <Text style={styles.typeaheadText}>{country}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Route tag</Text>
                  <Text style={styles.optionalLabel}>Optional</Text>
                </View>
                <Text style={styles.fieldHint}>Reference the immigration route or programme, if relevant.</Text>
                <TextInput
                  value={form.routeTag}
                  onChangeText={(text) => handleChange('routeTag', text)}
                  placeholder="e.g. Skilled Worker, Asylum"
                  placeholderTextColor={palette.textMuted}
                  style={styles.input}
                  onFocus={() => setShowRouteOptions(true)}
                  onBlur={() => setShowRouteOptions(false)}
                />
                {showRouteOptions && (
                  <View style={styles.typeaheadContainer}>
                    {filteredRoutes.length === 0 ? (
                      <Text style={styles.typeaheadEmpty}>No matches found</Text>
                    ) : (
                      filteredRoutes.map((route) => (
                        <TouchableOpacity
                          key={route}
                          style={styles.typeaheadItem}
                          activeOpacity={0.7}
                          onPress={() => handleSelectRoute(route)}
                        >
                          <Text style={styles.typeaheadText}>{route}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Summary</Text>
                <Text style={styles.fieldHint}>A short overview of what changed or the main outcome.</Text>
                <TextInput
                  value={form.summary}
                  onChangeText={(text) => handleChange('summary', text)}
                  placeholder="Key points, outcome, lessons..."
                  placeholderTextColor={palette.textMuted}
                  style={[styles.input, styles.multilineInput, errors.summary && styles.inputError]}
                  multiline
                />
                <Text style={styles.characterCount}>{form.summary.trim().length}/240 suggested</Text>
                {errors.summary && <Text style={styles.errorText}>{errors.summary}</Text>}
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Key details</Text>
                <Text style={styles.fieldHint}>Dates, evidence, or steps taken that shaped the result.</Text>
                <TextInput
                  value={form.keyDetails}
                  onChangeText={(text) => handleChange('keyDetails', text)}
                  placeholder="Supporting evidence, key steps, timelines..."
                  placeholderTextColor={palette.textMuted}
                  style={[styles.input, styles.multilineInput, errors.keyDetails && styles.inputError]}
                  multiline
                />
                {errors.keyDetails && <Text style={styles.errorText}>{errors.keyDetails}</Text>}
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>What this meant</Text>
                <Text style={styles.fieldHint}>Explain the impact and advice for others in a similar situation.</Text>
                <TextInput
                  value={form.meaning}
                  onChangeText={(text) => handleChange('meaning', text)}
                  placeholder="Impact, advice for others, next steps..."
                  placeholderTextColor={palette.textMuted}
                  style={[styles.input, styles.multilineInput, errors.meaning && styles.inputError]}
                  multiline
                />
                <Text style={styles.characterCount}>{form.meaning.trim().length}/280 suggested</Text>
                {errors.meaning && <Text style={styles.errorText}>{errors.meaning}</Text>}
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.stepContent}>
              {submitError && (
                <View style={styles.submitErrorBanner}>
                  <Ionicons name="warning-outline" size={18} color="#DC2626" />
                  <Text style={styles.submitErrorText}>{submitError}</Text>
                </View>
              )}

              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Image URLs</Text>
                  <Text style={styles.optionalLabel}>Optional</Text>
                </View>
                <Text style={styles.fieldHint}>Provide links or add images from your device to help illustrate the story.</Text>
                <TextInput
                  value={form.imageUrls}
                  onChangeText={(text) => handleChange('imageUrls', text)}
                  placeholder="Add one image URL per line"
                  placeholderTextColor={palette.textMuted}
                  style={[styles.input, styles.multilineInput]}
                  multiline
                />
                <Text style={styles.hintText}>
                  Separate multiple URLs with line breaks or add images from your device below.
                </Text>

                <TouchableOpacity
                  style={styles.uploadButton}
                  activeOpacity={0.85}
                  onPress={handleAddImageFromLibrary}
                >
                  <Ionicons name="image-outline" size={18} color={palette.primary} />
                  <Text style={styles.uploadButtonText}>Add from device library</Text>
                </TouchableOpacity>

                {imageEntries.length > 0 && (
                  <View style={styles.imagePreviewGrid}>
                    {imageEntries.map((uri) => (
                      <View key={uri} style={styles.imagePreviewWrapper}>
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          onPress={() => handleRemoveImage(uri)}
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
                )}
              </View>

              <View style={styles.reviewNotice}>
                <View style={styles.reviewIconWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={palette.primary} />
                </View>
                <View style={styles.reviewCopy}>
                  <Text style={styles.reviewTitle}>We review every story</Text>
                  <Text style={styles.reviewText}>
                    Once you submit, our team checks each story for safety, accuracy, and respectful tone before it appears on Borderlines. We may reach out if we need clarification.
                  </Text>
                </View>
              </View>

              <View style={styles.reviewSummary}>
                <Text style={styles.reviewSummaryTitle}>Quick check before submitting</Text>
                <View style={styles.summaryRow}>
                  <Ionicons name="newspaper-outline" size={16} color={palette.primary} />
                  <Text style={styles.summaryText}>{form.title.trim() || 'No headline yet'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="person-outline" size={16} color={palette.primary} />
                  <Text style={styles.summaryText}>
                    {form.shareAnonymously ? 'Anonymous contributor' : form.subtitle.trim() || 'No source yet'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="flag-outline" size={16} color={palette.primary} />
                  <Text style={styles.summaryText}>{form.countryTag.trim() || 'No country tag yet'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="book-outline" size={16} color={palette.primary} />
                  <Text style={styles.summaryText}>{form.summary.trim() || 'No summary yet'}</Text>
                </View>
              </View>

              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Preview in the feed</Text>
                <View style={styles.previewCard}>
                  <View style={[styles.previewCardAccent, previewAccentStyle]} />
                  <View style={styles.previewCardContent}>
                    <View style={styles.previewCardHeaderRow}>
                      <View style={styles.previewCardHeaderLeft}>
                        <Text style={styles.previewCardCategoryLabel}>{previewCategoryLabel}</Text>
                        <Text style={styles.previewCardBadge}>PREVIEW</Text>
                      </View>
                      <Text
                        style={[
                          styles.previewCardTagText,
                          previewTagLineIsPlaceholder && styles.previewPlaceholder,
                        ]}
                        numberOfLines={1}
                      >
                        {previewTagLineText}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.previewCardSource,
                        previewSourceIsPlaceholder && styles.previewPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {previewSourceText}
                    </Text>
                    <Text
                      style={[
                        styles.previewCardTitle,
                        previewTitleIsPlaceholder && styles.previewPlaceholder,
                      ]}
                      numberOfLines={2}
                    >
                      {previewTitleText}
                    </Text>
                    <Text
                      style={[
                        styles.previewCardSummary,
                        previewSummaryIsPlaceholder && styles.previewPlaceholder,
                      ]}
                      numberOfLines={2}
                    >
                      {previewSummaryText}
                    </Text>
                    <View style={styles.previewCardMetaRow}>
                      <Text style={styles.previewCardMeta}>Just now</Text>
                      <View style={styles.previewCardDot} />
                      <Text style={styles.previewCardMeta}>Awaiting review</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footerBar}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
            activeOpacity={currentStep === 0 ? 1 : 0.8}
            onPress={handleBack}
            disabled={currentStep === 0}
          >
            <Ionicons
              name="chevron-back"
              size={16}
              color={currentStep === 0 ? palette.textMuted : palette.text}
            />
            <Text
              style={[
                styles.navButtonText,
                currentStep === 0 && styles.navButtonTextDisabled,
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isFinalStep && styles.primaryButtonFinal,
              isPrimaryDisabled && styles.primaryButtonDisabled,
            ]}
            activeOpacity={isPrimaryDisabled ? 1 : 0.9}
            onPress={isFinalStep ? handleSubmit : handleNext}
            disabled={isPrimaryDisabled}
          >
            {isFinalStep && isSubmitting ? (
              <View style={styles.primaryButtonContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  root: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: palette.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1F2933',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  topBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  topBarTitle: {
    ...theme.typography.subtitle,
    color: palette.text,
  },
  topBarSubtitle: {
    marginTop: 6,
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  label: {
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  fieldHint: {
    ...theme.typography.caption,
    color: palette.textMuted,
    marginBottom: 4,
  },
  input: {
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.divider,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...theme.typography.body,
    color: palette.text,
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FDE8E8',
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F7FB',
  },
  categoryChipActive: {
    backgroundColor: palette.text,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryLabel: {
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  errorText: {
    ...theme.typography.caption,
    color: '#DC2626',
    marginTop: 4,
  },
  typeaheadContainer: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.divider,
    overflow: 'hidden',
  },
  typeaheadEmpty: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  typeaheadItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  typeaheadText: {
    ...theme.typography.body,
    color: palette.text,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: palette.primary,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  submitLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hintText: {
    marginTop: 6,
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  optionalLabel: {
    ...theme.typography.caption,
    color: palette.textMuted,
    fontStyle: 'italic',
  },
  uploadButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: `${palette.primary}14`,
  },
  uploadButtonText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: palette.primary,
  },
  imagePreviewGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imagePreviewWrapper: {
    width: 96,
    height: 96,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: palette.surface,
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  stepHeader: {
    marginBottom: 24,
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
    letterSpacing: 1,
    textAlign: 'center',
  },
  stepLabelError: {
    color: '#DC2626',
  },
  stepLabelActive: {
    color: palette.text,
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  progressFill: {
    backgroundColor: palette.primary,
  },
  stepContent: {
    gap: 18,
  },
  disabledInput: {
    backgroundColor: palette.background,
    color: palette.textMuted,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  anonymousLabel: {
    flex: 1,
    ...theme.typography.caption,
    color: palette.textSubtle,
    lineHeight: 18,
  },
  guidanceCard: {
    flexDirection: 'row',
    borderRadius: 22,
    backgroundColor: palette.surface,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  guidanceIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${palette.primary}12`,
  },
  guidanceCopy: {
    flex: 1,
    gap: 4,
  },
  guidanceTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: palette.text,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  guidanceText: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    lineHeight: 18,
  },
  characterCount: {
    marginTop: 4,
    alignSelf: 'flex-end',
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  reviewNotice: {
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 20,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  reviewIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${palette.primary}12`,
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
  reviewText: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    lineHeight: 18,
  },
  reviewSummary: {
    marginTop: 16,
    gap: 12,
    borderRadius: 20,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  reviewSummaryTitle: {
    ...theme.typography.caption,
    color: palette.text,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    ...theme.typography.body,
    color: palette.textSubtle,
  },
  previewSection: {
    gap: 12,
  },
  previewSectionTitle: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  previewCard: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.divider,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  previewCardAccent: {
    width: 10,
    backgroundColor: palette.primary,
  },
  previewCardAccentLaw: {
    backgroundColor: '#2563EB',
  },
  previewCardAccentPersonal: {
    backgroundColor: '#EC4899',
  },
  previewCardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  previewCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewCardCategoryLabel: {
    ...theme.typography.caption,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: palette.textSubtle,
  },
  previewCardBadge: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    backgroundColor: palette.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    letterSpacing: 0.6,
    overflow: 'hidden',
  },
  previewCardTagText: {
    ...theme.typography.caption,
    color: palette.textSubtle,
    flexShrink: 1,
    textAlign: 'right',
  },
  previewCardSource: {
    ...theme.typography.caption,
    color: palette.textSubtle,
  },
  previewCardTitle: {
    ...theme.typography.body,
    color: palette.text,
    fontWeight: '600',
  },
  previewCardSummary: {
    ...theme.typography.caption,
    color: palette.textMuted,
    lineHeight: 18,
  },
  previewCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  previewCardMeta: {
    ...theme.typography.caption,
    color: palette.textMuted,
  },
  previewCardDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.divider,
  },
  previewPlaceholder: {
    color: palette.textMuted,
    fontStyle: 'italic',
  },
  submitErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: '#FDE8E8',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  submitErrorText: {
    flex: 1,
    ...theme.typography.caption,
    color: '#B91C1C',
  },
  footerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
    backgroundColor: palette.surface,
    marginBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },
  navButtonDisabled: {
    backgroundColor: palette.background,
  },
  navButtonText: {
    ...theme.typography.caption,
    color: palette.text,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: palette.textMuted,
  },
  primaryButton: {
    paddingHorizontal: 36,
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: palette.text,
  },
  primaryButtonFinal: {
    backgroundColor: palette.primary,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
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
});

export default CreateStoryScreen;
