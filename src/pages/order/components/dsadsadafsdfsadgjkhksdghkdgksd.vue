<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps(['base_data'])
const emit = defineEmits(['updateValue']);

const value_data = ref({
    fieIdValue: '',
})

function updateValue() {
    emit('updateValue', value_data.value)
}
</script>

<template>
    <div class="fieId-box">
        <div class="fieId-label">{{ props.base_data.fieIdName }}</div>
        <div class="fieId-content">
            
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>