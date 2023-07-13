<script setup>

const { data: business, pending, refresh, execute, error } = await useAsyncData(
  'profile-info', 
  () => {
    try {
      return $fetch(`/api/business/allBusiness?user_name=101`)
    } catch (error) {
      return error;
    }
  }
)
</script>


<template>
    <div v-if="pending">
        LOADING...
    </div>

    <div v-else-if="error">Error al cargar los datos: {{ error }}</div>

    <div>
        <div v-for="nightClub in business" :key="nightClub.name">
          <h2>{{ nightClub.name }}</h2>
          <p>{{ nightClub.address }}</p>
          <p>{{ nightClub.description }}</p>
          
          <h3>Combos:</h3>
          <div v-for="combo in nightClub.id_business" :key="combo.id_combo">
            <h4>{{ combo.name }}</h4>
            <p>{{ combo.description }}</p>
          </div>
          
          <h3>Horarios de apertura:</h3>
          <ul>
            <li v-for="(openingHours, day) in nightClub.opening_hours" :key="day">
              {{ day }}: {{ openingHours.opening_time }} - {{ openingHours.closing_time }}
            </li>
          </ul>
          
          <hr />
        </div>
    </div>

</template>