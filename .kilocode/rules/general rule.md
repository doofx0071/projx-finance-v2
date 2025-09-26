# General Rules for Development

These rules ensure consistent, efficient, and high-quality development practices across all projects.

## MCP (Model Context Protocol) Usage Rules

### 🔍 **ALWAYS Use MCP When Lacking Context**
- **MANDATORY**: Use MCP tools whenever you need external information, documentation, or context that you don't have
- **Research First**: Before implementing any feature, use MCP to gather comprehensive information
- **Stay Updated**: Use MCP to check for latest versions, best practices, and documentation updates
- **API Integration**: Always research APIs, pricing, and integration patterns using MCP before implementation

### 📚 **MCP Research Workflow**
1. **Identify Knowledge Gap**: Recognize when you need external information
2. **Choose Appropriate Tool**: Select the right MCP tool (exa or lavify for web search, context for docs)
3. **Gather Comprehensive Data**: Don't settle for partial information - get complete context
4. **Verify Information**: Cross-reference information from multiple sources when possible
5. **Document Findings**: Update relevant documentation with new findings

### 🎯 **When to Use MCP**
- ✅ API documentation and integration guides
- ✅ Latest library versions and breaking changes
- ✅ Best practices and design patterns
- ✅ Pricing and cost information
- ✅ Security considerations and compliance
- ✅ Performance optimization techniques
- ✅ Framework-specific implementations

## Shadcn UI Component Installation Rules

### 🛠️ **Component Installation Protocol**
- **ALWAYS Use CLI**: Never manually create shadcn components - always use `npx shadcn@latest add [component]`
- **Verify Dependencies**: Check that all required dependencies are installed before adding components
- **Test Installation**: After adding components, verify they work correctly in your application
- **Update Documentation**: Document newly added components in relevant files

### 📦 **Component Addition Workflow**
1. **Identify Need**: Determine which shadcn component is required for the feature
2. **Check Existing**: Verify the component isn't already installed
3. **Install via CLI**: Use `npx shadcn@latest add [component-name]`
4. **Import Correctly**: Use the proper import path from `@/components/ui/[component]`
5. **Test Functionality**: Ensure the component works as expected
6. **Update Types**: Verify TypeScript types are properly configured

### 🎨 **Common Shadcn Components to Install**
- **button**: Always install first (required by most other components)
- **input, label**: For forms
- **card**: For content containers
- **dialog, sheet**: For modals and side panels
- **table**: For data display
- **dropdown-menu**: For navigation and actions
- **badge**: For status indicators
- **toast**: For notifications

### ⚠️ **Component Installation Best Practices**
- Install components one at a time to avoid conflicts
- Check for dependency requirements before installation
- Update `components.json` if needed for custom configurations
- Test components in isolation before integrating into features
- Document component usage in component libraries or README files

## Development Workflow Rules

### 🔄 **Feature Implementation Order**
1. **Research**: Use MCP to gather requirements and best practices
2. **Plan**: Design the feature architecture
3. **Install**: Add required shadcn components via CLI
4. **Implement**: Build the feature following established patterns
5. **Test**: Verify functionality and integration
6. **Document**: Update documentation with new features

### 📝 **Documentation Standards**
- Keep API documentation in `mds/docs/` folder
- Update README with new features and setup instructions
- Document environment variables and configuration
- Include code examples and usage patterns

### 🧪 **Testing Requirements**
- Test all external API integrations before production use
- Verify component installations work correctly
- Document test procedures for future reference
- Clean up test files after verification

## Code Quality Rules

### 🎯 **Import and Usage Standards**
- Use proper TypeScript imports and types
- Follow established naming conventions
- Implement proper error handling
- Use environment variables for configuration

### 🔍 **Linting and Code Quality**
- **Run ESLint Regularly**: Always run `npm run lint` before committing code
- **Fix All Errors**: Resolve all ESLint errors before merging code (build will fail on errors)
- **Handle Warnings**: Address critical warnings, especially those affecting performance or security
- **ESLint Configuration**: Modify `eslint.config.mjs` to disable problematic rules when necessary
- **Next.js Specific Rules**:
  - Use `<Link>` instead of `<a>` for internal navigation
  - Use `<Image>` from `next/image` instead of `<img>` for optimized loading
  - Escape special characters in JSX text (`'` for apostrophes, `"` for quotes)
- **Remove Unused Imports**: Clean up unused imports to reduce bundle size
- **Consistent Formatting**: Use Prettier or similar tools for consistent code formatting

### 🔒 **Security and Best Practices**
- Never commit sensitive information
- Use proper authentication and authorization
- Implement input validation and sanitization
- Follow OWASP security guidelines

### 📊 **Performance Considerations**
- Optimize bundle size and loading times
- Implement proper caching strategies
- Use efficient algorithms and data structures
- Monitor and optimize API usage

### 🖱️ **Cursor and Interaction Styles**
- **Cursor Pointer for Interactive Elements**: Ensure all buttons, links, and clickable elements display `cursor: pointer` on hover
- **Consistent User Experience**: Apply `cursor-pointer` class to all interactive UI components (buttons, toggles, links)
- **Global Link Styling**: Add `cursor: pointer` to all `<a>` tags in global CSS for consistent link behavior
- **Component-Level Implementation**: Include `cursor-pointer` in base variants of reusable components like Button and Toggle
