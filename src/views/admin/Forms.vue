<script setup>
import DemoFormLayoutHorizontalForm from './elements/forms/DemoFormLayoutHorizontalForm.vue'
import DemoFormLayoutHorizontalFormWithIcons from './elements/forms/DemoFormLayoutHorizontalFormWithIcons.vue'
import DemoFormLayoutMultipleColumn from './elements/forms/DemoFormLayoutMultipleColumn.vue'
import DemoFormLayoutVerticalForm from './elements/forms/DemoFormLayoutVerticalForm.vue'
import DemoFormLayoutVerticalFormWithIcons from './elements/forms/DemoFormLayoutVerticalFormWithIcons.vue'
</script>

<template>
  <VRow>
    <VCol cols="12" md="6">
      <VCard title="Vertical Form">
        <VCardText>
          <DemoFormLayoutVerticalForm />
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12" md="6">
      <VCard title="Vertical Form with Icons">
        <VCardText>
          <DemoFormLayoutVerticalFormWithIcons />
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard title="Horizontal Form">
        <VCardText>
          <DemoFormLayoutHorizontalForm />
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard title="Horizontal Form with Icons">
        <VCardText>
          <DemoFormLayoutHorizontalFormWithIcons />
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard title="Multiple Column">
        <VCardText>
          <DemoFormLayoutMultipleColumn />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
