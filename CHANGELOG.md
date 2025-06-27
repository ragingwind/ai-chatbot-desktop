# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Multi-Provider Support**: Complete implementation of dynamic AI provider selection
  - Users can now select between Anthropic Claude, xAI Grok, Ollama, and WebLLM providers
  - Provider selection persists via cookies and affects all AI operations
  - New `ProviderModelSelector` component with provider icons and descriptions
  - Provider-based entitlements system for access control

### Enhanced
- **Chat API**: Updated to use selected provider for all AI operations
  - Added `selectedProvider` field to request schema
  - Dynamic provider selection using `getProviderById()` function
  - Provider preference flows through entire conversation including artifacts

- **Artifact Generation**: All artifact types now respect selected provider
  - Text, code, sheet, and image artifacts use user-selected provider
  - Safe fallback to xAI for image generation (only provider with image support)
  - Provider information passed through tool system to artifact handlers

- **Entitlements System**: Enhanced user access control
  - Added `availableProviderIds` to control provider access by user type
  - Both guest and regular users have access to all providers
  - Future-ready for provider-specific premium features

### Changed
- **Provider Architecture**: Refactored from hardcoded to dynamic provider selection
  - Removed `myProvider` singleton in favor of `getProviderById()` function
  - Added `getImageProviderById()` for safe image model access
  - All tools and handlers now accept `selectedProvider` parameter

- **Component Updates**: Enhanced UI components for multi-provider support
  - Updated `ChatHeader` to display and pass provider model selection
  - Enhanced `Chat` component to include provider in API requests
  - Provider model selector respects user entitlements

### Technical Improvements
- **Type Safety**: Full TypeScript support for multi-provider architecture
- **Error Handling**: Graceful fallbacks when providers don't support specific features
- **Code Organization**: Clear separation between chat models and provider models
- **Performance**: Optimized provider selection with proper caching

### Purpose
This major update enables users to choose their preferred AI provider for each conversation, providing flexibility and choice while maintaining a consistent user experience. The architecture supports easy addition of new providers and provider-specific features in the future.