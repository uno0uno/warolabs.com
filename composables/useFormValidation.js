import { ref } from 'vue';

export function useFormValidation(formData, countries) { 
    const errors = ref({});
    const rules = {
        name: [
            (value) => (value && value.trim() ? null : 'Este campo es obligatorio.'),
            (value) => (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(value) ? null : 'Solo se permiten letras y espacios.'),
            (value) => (value && value.trim().length >= 2 ? null : 'Debe tener al menos 2 caracteres.'),
            (value) => (!/^\d+$/.test(value) ? null : 'No puede contener solo números.'),
        ],
        email: [
            (value) => (value && value.trim() ? null : 'Este campo es obligatorio.'),
            (value) => {
                if (!value) return null;
                if (!value.includes('@')) return 'Falta el símbolo @.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato inválido.';
                return null;
            },
            (value) => {
                if (!value) return null;
                const forbiddenDomains = [
                    'example.com', 'test.com', 'mailinator.com', 'tempmail.com', 'fake.com', 'email.com'
                ];
                const domain = value.split('@')[1]?.toLowerCase();
                return forbiddenDomains.includes(domain)
                    ? 'El dominio no está permitido.'
                    : null;
            },
            (value) => {
                if (!value) return null;
                const username = value.split('@')[0];
                if (/^\d+$/.test(username) || username.length < 3) {
                    return 'El nombre antes de la arroba no es válido.';
                }
                if (/^(.)\1+$/.test(username)) {
                    return 'No se permiten caracteres repetidos en el nombre antes de la arroba.';
                }
                return null;
            }
        ],
        phone: [
            (value) => (value && value.trim() ? null : 'Este campo es obligatorio.'),
            (value) => (/^\d+$/.test(value) ? null : 'Solo se permiten números.'),
        ],

        phoneCountryCode: [
            (value) => {
                const isValidCountry = countries.value.some(country => country.phone_code === value);
                return isValidCountry ? null : 'Selecciona algún país.';
            }
        ],
    };

    const validateField = (fieldName) => {
        errors.value[fieldName] = null; 
        const value = formData.value[fieldName];
        console.log(`Validating field: ${fieldName} with value: ${value}`);

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