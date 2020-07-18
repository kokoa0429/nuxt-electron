export { default as Logo } from '../..\\app\\components\\Logo.vue'
export { default as VuetifyLogo } from '../..\\app\\components\\VuetifyLogo.vue'

export const LazyLogo = import('../..\\app\\components\\Logo.vue' /* webpackChunkName: "components_Logo'}" */).then(c => c.default || c)
export const LazyVuetifyLogo = import('../..\\app\\components\\VuetifyLogo.vue' /* webpackChunkName: "components_VuetifyLogo'}" */).then(c => c.default || c)
