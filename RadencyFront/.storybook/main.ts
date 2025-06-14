import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.ts'],

    addons: ['@storybook/addon-links', 
    '@storybook/addon-essentials', '@chromatic-com/storybook'],

    framework: {
        name: '@storybook/angular',
        options: {},
    },

    docs: {
        autodocs: true
    }
};
export default config;