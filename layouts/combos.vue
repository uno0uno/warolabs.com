<template>
    <div>
        <header>
            <nav>
                <NuxtLink to="/combos">Home Combos</NuxtLink>
            </nav>
        </header>

        <!-- output the oage content -->
        <div>
            <slot />
            
        </div>

        <footer>
            <ul>
                <NuxtLink to="/">Home</NuxtLink>
            </ul>
        </footer>
    </div>
</template>
