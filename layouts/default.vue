<template>
    <div>
        <header>
            <nav>
                <NuxtLink to="/">Home</NuxtLink>
                <ul>
                    <NuxtLink to="/combo">Combo</NuxtLink>
                </ul>
            </nav>
        </header>

        <!-- output the oage content -->
        <div>
            <slot />
        </div>
    </div>
</template>

<script setup>

useSchemaOrg([
  // @todo Select Identity: https://unhead-schema-org.harlanzw.com//guide/guides/identity
  defineWebSite({
    name: 'My Awesome Website',
  }),
  defineWebPage(),
])
</script>