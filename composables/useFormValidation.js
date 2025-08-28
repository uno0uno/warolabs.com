import { ref } from 'vue';

export function useFormValidation(formData) {
    const errors = ref({});
    const rules = {
        name: [
            (value) => (value && value.trim() ? null : 'El nombre es obligatorio.'),
            (value) => (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(value) ? null : 'El nombre debe contener solo letras y espacios.'),
            (value) => (value && value.trim().length >= 2 ? null : 'El nombre debe tener al menos 2 caracteres.'),
            (value) => (!/^\d+$/.test(value) ? null : 'El nombre no puede ser solo números.'),
        ],
        email: [
            (value) => (value && value.trim() ? null : 'El correo electrónico es obligatorio.'),
            (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Formato de correo electrónico inválido.'),
            (value) => {
                if (!value) return null;
                const forbiddenDomains = [
                    'example.com', 'test.com', 'mailinator.com', 'tempmail.com', 'fake.com', 'email.com'
                ];
                const domain = value.split('@')[1]?.toLowerCase();
                return forbiddenDomains.includes(domain)
                    ? 'Por favor, ingresa un correo electrónico válido.'
                    : null;
            },
            (value) => {
                if (!value) return null;
                const username = value.split('@')[0];
                if (/^\d+$/.test(username) || username.length < 3) {
                    return 'El correo electrónico no es válido.';
                }
                if (/^(.)\1+$/.test(username)) {
                    return 'El correo electrónico no es válido.';
                }
                return null;
            }
        ],
        phone: [
            (value) => (value && value.trim() ? null : 'El número de teléfono es obligatorio.'),
            (value) => (/^\d+$/.test(value) ? null : 'El número de teléfono debe contener solo números.'),
        ],
    };

    const validateField = (fieldName) => {
        errors.value[fieldName] = null; 
        const value = formData.value[fieldName];

        if (rules[fieldName]) {
            for (const rule of rules[fieldName]) {
                const errorMessage = rule(value);
                if (errorMessage) {
                    errors.value[fieldName] = errorMessage;
                    break;
                }
            }
        }
    };

    const validate = () => {
        let isValid = true;
        for (const field in rules) {
            validateField(field);
            if (errors.value[field]) {
                isValid = false;
            }
        }
        return isValid;
    };

    return {
        errors,
        validate,
        validateField, 
    };
}