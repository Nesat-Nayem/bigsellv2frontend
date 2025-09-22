// src/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { privacyPolicyApi } from "./privacyPolicyApi";
import { categoryApi } from "./categoryApi";
import { productsApi } from "./productApi";
import { TermsApi } from "./termsApi";
import { helpSupportApi } from "./helpSupportApi";
import { faqApi } from "./faqApi";
import { blogsApi } from "./blogsApi";
import { generalSettingsApi } from "./generalSettings";
import { DisclaimerResponseApi } from "./disclaimerApi";
import { PaymentPolicyApi } from "./paymentPolicyApi";
import { ShippingPolicyApi } from "./shippingPolicy";
import { SiteSecurityApi } from "./siteSecurity";
import { contactApi } from "./contactApi";
import { vendorPolicyApi } from "./vendorPolicyApi";
import { headerBannerApi } from "./headerBannerApi";
import { mainBannerApi } from "./mainBannerApi";
import { ordersApi } from "./ordersApi";
import { paymentsApi } from "./paymentApi";
import { productCategoryApi } from "./productCategoryApi";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [TermsApi.reducerPath]: TermsApi.reducer,
    [helpSupportApi.reducerPath]: helpSupportApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
    [blogsApi.reducerPath]: blogsApi.reducer,
    [generalSettingsApi.reducerPath]: generalSettingsApi.reducer,
    [DisclaimerResponseApi.reducerPath]: DisclaimerResponseApi.reducer,
    [PaymentPolicyApi.reducerPath]: PaymentPolicyApi.reducer,
    [ShippingPolicyApi.reducerPath]: ShippingPolicyApi.reducer,
    [SiteSecurityApi.reducerPath]: SiteSecurityApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [vendorPolicyApi.reducerPath]: vendorPolicyApi.reducer,
    [headerBannerApi.reducerPath]: headerBannerApi.reducer,
    [mainBannerApi.reducerPath]: mainBannerApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [productCategoryApi.reducerPath]: productCategoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      privacyPolicyApi.middleware,
      categoryApi.middleware,
      productsApi.middleware,
      TermsApi.middleware,
      helpSupportApi.middleware,
      faqApi.middleware,
      blogsApi.middleware,
      generalSettingsApi.middleware,
      DisclaimerResponseApi.middleware,
      PaymentPolicyApi.middleware,
      ShippingPolicyApi.middleware,
      SiteSecurityApi.middleware,
      contactApi.middleware,
      vendorPolicyApi.middleware,
      headerBannerApi.middleware,
      mainBannerApi.middleware,
      ordersApi.middleware,
      paymentsApi.middleware,
      productCategoryApi.middleware
    ),
  // Optional: toggle devTools only in dev
  devTools: process.env.NODE_ENV !== "production",
});

// enable refetchOnFocus/refetchOnReconnect behaviors and listeners
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
