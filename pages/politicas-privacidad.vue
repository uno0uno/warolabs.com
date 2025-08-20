<script setup>
import { useHead } from '#imports';

definePageMeta({
    layout: 'landingv2'
});

useHead({
  title: 'Política de Privacidad | Waro Labs',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
});
</script>

<template>
<div class="w-full flex items-center justify-center h-full">
  <div class="text-center flex flex-col items-center w-full h-full justify-center gap-4 px-0 lg:min-w-[48rem] max-w-6xl lg:px-12 relative z-0 bg-slate-50">
    <h1 class="text-4xl font-bold mb-6">Política de Privacidad</h1>

    <p>
      En Waro Labs, nos comprometemos a proteger su privacidad. Esta política de privacidad describe cómo recopilamos, utilizamos y protegemos su información personal. Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política.
    </p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">1. Información que Recopilamos</h2>
    <p>
      Recopilamos información personal de varias maneras, incluyendo los datos que nos proporciona directamente al crear un perfil o interactuar con nuestras campañas. La información que podemos recopilar incluye:
    </p>
    <ul>
      <li>
        **Información de Perfil**: Recopilamos datos personales como su nombre, correo electrónico, número de teléfono y nacionalidad cuando crea una cuenta. También puede proporcionar detalles opcionales como el nombre de su empresa, nombre de usuario, ciudad, país y descripciones.
      </li>
      <li>
        **Datos de Campañas y Formularios**: Cuando se registra a través de una de nuestras páginas de eventos, recopilamos su nombre, correo electrónico y número de teléfono. Además, se registra información técnica como la fuente de su interés, la dirección IP y el navegador utilizado para asociar su registro a una campaña específica.
      </li>
      <li>
        **Datos de Pagos**: Para procesar transacciones, se recopilan datos del cliente y de facturación, como el correo electrónico, método de pago, monto y estado de la transacción.
      </li>
      <li>
        **Cookies y Seguimiento**: Utilizamos cookies para gestionar su sesión de autenticación. También integramos herramientas de análisis para medir el rendimiento del sitio, si están configuradas para su entorno.
      </li>
    </ul>

    <h2 class="text-2xl font-semibold mt-8 mb-4">2. Uso de la Información</h2>
    <p>
      Utilizamos la información recopilada para los siguientes propósitos:
    </p>
    <ul>
      <li>
        **Gestión de Servicios**: Para crear y administrar su perfil, procesar registros en eventos, y manejar su participación en campañas.
      </li>
      <li>
        **Comunicación**: Para enviarle comunicaciones importantes, como correos electrónicos de bienvenida y enlaces de verificación de su identidad.
      </li>
      <li>
        **Mejora de la Experiencia**: La información nos ayuda a entender las interacciones de los usuarios con nuestros servicios y a mejorar la plataforma de manera continua.
      </li>
    </ul>

    <h2 class="text-2xl font-semibold mt-8 mb-4">3. Seguridad y Protección de Datos</h2>
    <p>
      Nos tomamos la seguridad de los datos muy en serio.
    </p>
    <ul>
      <li>
        **Autenticación**: Empleamos un sistema de tokens de seguridad para asegurar que solo los usuarios autorizados puedan acceder a funcionalidades protegidas.
      </li>
      <li>
        **Encriptación**: Los datos sensibles, como su dirección de correo electrónico en nuestros formularios, se encriptan con un método de clave pública antes de ser procesados por el servidor.
      </li>
      <li>
        **Acceso a la Base de Datos**: Todas las operaciones con nuestra base de datos se gestionan a través de un sistema centralizado que asegura conexiones seguras y un manejo consistente de errores.
      </li>
    </ul>

    <h2 class="text-2xl font-semibold mt-8 mb-4">4. Sus Derechos</h2>
    <p>
      Usted tiene la capacidad de controlar su información personal. La plataforma ofrece la opción de una "eliminación suave" de su perfil. Esta acción lo desactiva, junto con cualquier contenido que haya creado, como artículos o comentarios. Sin embargo, esta acción no es posible si tiene compromisos activos, como reservas o pedidos pendientes, lo que ayuda a mantener la integridad de las operaciones de la plataforma. También puede actualizar la información de su perfil cuando lo necesite a través de las opciones de edición disponibles.
    </p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">5. Contacto</h2>
    <p>
      Si tiene alguna pregunta sobre esta política de privacidad o sobre el manejo de sus datos, por favor contáctenos en <a href="mailto:contacto@warolabs.com" class="text-blue-600 hover:underline">contacto@warolabs.com</a>.
    </p>
  </div>
</div>
</template>