import { useState, useCallback } from 'react';

/**
 * useFormState — abstracts away standard onChange/onBlur boilerplate
 * and handles validation on blur + submit.
 *
 * @param {object} initialValues
 * @param {function} validateFn - returns { fieldName: 'error string', ... }
 */
export default function useFormState(initialValues, validateFn) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error eagerly when typing
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      // Run full validation and pluck out this field's error
      const { errors: currentErrors } = validateFn(values);
      setErrors((prev) => ({ ...prev, [name]: currentErrors[name] || '' }));
    },
    [validateFn, values]
  );

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // View helpers
  const err = useCallback((name) => (touched[name] ? errors[name] : ''), [touched, errors]);
  
  const inputClass = useCallback((name, baseClass = 'input h-10 text-sm') => {
    const errorStr = err(name);
    return [
      baseClass,
      errorStr ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : '',
    ].filter(Boolean).join(' ');
  }, [err]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    resetForm,
    err,
    inputClass,
  };
}
