---
description: Strict rule - No logic inside JSX components
---

# No Logic in JSX Components - Strict Rule

## 🚫 **STRICT PROHIBITION**

**ABSOLUTELY NO BUSINESS LOGIC IS ALLOWED INSIDE JSX COMPONENTS**

## 📋 **What is PROHIBITED in JSX Components:**

### ❌ **Business Logic:**
- Data validation
- API calls
- Complex calculations
- Business rules
- Data transformation
- State management logic
- Date/time calculations
- Form validation logic
- Conditional business logic

### ❌ **Complex Functions:**
- Validation functions
- Data processing functions
- Algorithm implementations
- Business rule functions
- Complex conditional logic

### ❌ **Hook Logic:**
- Custom hook implementations
- Complex useEffect logic
- Business logic in event handlers

## ✅ **What is ALLOWED in JSX Components:**

### ✅ **UI Logic Only:**
- Simple conditional rendering (`{condition && <Component />}`)
- Mapping for rendering (`{items.map(item => <Item key={item.id} />)}`)
- Event handler delegation (`onClick={() => onAction(value)}`)
- Simple string formatting
- CSS class logic
- Animation logic
- UI state (show/hide, active/inactive)

### ✅ **Component-Only Code:**
- Import statements
- Component definitions
- Props destructuring
- JSX rendering
- Styling (CSS classes, styles)
- Simple prop transformations for display

## 🏗️ **Required Architecture:**

### **Hooks (`/hooks/*.ts`) MUST contain:**
- All business logic
- Data validation
- API calls
- Complex calculations
- Business rules
- Data transformation
- State management
- Form validation

### **Components (`/components/**/*.tsx`) MUST contain:**
- Only JSX rendering
- Simple UI logic
- Event handler delegation
- Props interface definitions
- Import statements

## 📝 **Example - ❌ WRONG (Logic in Component):**

```typescript
// ❌ WRONG - Logic in JSX component
export function BadComponent() {
  const [data, setData] = useState([]);
  
  // ❌ Business logic in component
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // ❌ Complex calculation in component
  const calculateTotal = (items: Item[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  // ❌ Business logic in event handler
  const handleSubmit = () => {
    if (validateEmail(email)) {
      // Complex logic here
      const processedData = data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
      setData(processedData);
    }
  };
  
  return <div>...</div>;
}
```

## 📝 **Example - ✅ CORRECT (Logic in Hook):**

```typescript
// ✅ CORRECT - Logic in hook
export function useComponentLogic() {
  const [data, setData] = useState([]);
  
  // ✅ All business logic in hook
  const validateEmail = useCallback((email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);
  
  // ✅ Complex calculations in hook
  const calculateTotal = useCallback((items: Item[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, []);
  
  // ✅ Business logic in hook
  const handleSubmit = useCallback(() => {
    if (validateEmail(email)) {
      const processedData = data.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
      setData(processedData);
    }
  }, [validateEmail, data, email]);
  
  return {
    data,
    validateEmail,
    calculateTotal,
    handleSubmit
  };
}

// ✅ CORRECT - Only JSX in component
export function GoodComponent() {
  const {
    data,
    validateEmail,
    calculateTotal,
    handleSubmit
  } = useComponentLogic();
  
  // ✅ Only UI logic and rendering
  return (
    <div>
      <button onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}
```

## 🔍 **Code Review Checklist:**

### **Before committing JSX components, ask:**
1. Does this component contain any business logic?
2. Are there any complex calculations?
3. Is there data validation logic?
4. Are there API calls?
5. Is there business rule logic?
6. Can this logic be moved to a hook?

### **If YES to any question - MOVE LOGIC TO HOOK!**

## ⚠️ **Enforcement:**

### **Code Review:**
- ALL JSX components must be reviewed for logic violations
- Any logic found must be moved to hooks before approval
- Pull requests will be rejected if logic is found in components

### **Automated Checks:**
- ESLint rules should be configured to detect logic patterns
- TypeScript strict mode to catch complex logic
- Pre-commit hooks to scan for logic patterns

### **Team Responsibility:**
- Every developer must enforce this rule
- Senior developers must mentor juniors on this architecture
- Code reviews must specifically check for logic violations

## 🎯 **Benefits:**

1. **Separation of Concerns** - Clear separation between business logic and UI
2. **Testability** - Business logic can be tested independently
3. **Reusability** - Logic can be reused across components
4. **Maintainability** - Easier to maintain and debug
5. **Performance** - Better optimization opportunities
6. **Scalability** - Architecture scales with team size

## 🚨 **ZERO TOLERANCE POLICY**

**This is a strict rule with NO exceptions.**
- Logic found in JSX components MUST be immediately refactored
- No "temporary" logic allowed in components
- No "just this once" exceptions
- No "it's too small to matter" excuses

**ALL LOGIC BELONGS IN HOOKS. ALWAYS.**
