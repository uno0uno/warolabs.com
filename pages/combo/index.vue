<template>
  <div>
    <SchemaOrgEvent
      :name="eventName"
      :location="eventLocation"
      :image="eventImage"
      :organizer="eventOrganizer"
      :performer="eventPerformer"
      :offers="eventOffers"
      :description="eventDescription"
      :startDate="eventStartDate"
      :endDate="eventEndDate"
      :eventStatus="eventStatus"
      :eventAttendanceMode="eventAttendanceMode"
    />
  </div>
  <SchemaOrgDebug />
</template>

<script setup>

const eventName = 'The Adventures of Kira and Morrison'
const eventLocation = [
  'https://operaonline.stream5.com/',
  {
    name: 'Snickerpark Stadium',
    address: {
      streetAddress: '100 West Snickerpark Dr',
      addressLocality: 'Snickertown',
      postalCode: '19019',
      addressRegion: 'PA',
      addressCountry: 'US',
    },
  },
]
const eventImage = [
  'https://example.com/photos/1x1/photo.jpg',
  'https://example.com/photos/4x3/photo.jpg',
  'https://example.com/photos/16x9/photo.jpg',
]
const eventOrganizer = {
  name: 'Kira and Morrison Music',
  url: 'https://kiraandmorrisonmusic.com',
}
const eventPerformer = {
  '@type': 'PerformingGroup',
  name: 'Kira and Morrison',
}
const eventOffers = {
  price: 30,
  url: 'https://www.example.com/event_offer/12345_201803180430',
  validFrom: new Date(Date.UTC(2024, 5, 21, 12)),
}
const eventDescription = "The Adventures of Kira and Morrison is coming to Snickertown in a can't miss performance."
const eventStartDate = '2025-07-21T19:00-05:00'
const eventEndDate = '2025-07-21T23:00-05:00'
const eventStatus = 'EventScheduled'
const eventAttendanceMode = 'MixedEventAttendanceMode'
</script>
