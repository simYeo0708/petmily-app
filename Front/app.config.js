import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    kakaoMapApiKey: process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY,
  },
});