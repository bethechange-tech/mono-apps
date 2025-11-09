const likesEnvValue = process.env.EXPO_PUBLIC_SHOW_LIKES ?? process.env.SHOW_LIKES;

export const featureFlags = {
  showLikes: likesEnvValue === 'true',
};

export const SHOW_LIKES = featureFlags.showLikes;
