<script setup>
const props = defineProps(['title'])
</script>

<template>
    <div class="flex-center inviteFriendsGridItem">
        <div class="flex-center">
            <div class="desciconLarge"></div>
            <span class="font-middle">{{ title }}</span>
        </div>
        <slot></slot>
    </div>
</template>

<style scoped lang="scss">
.inviteFriendsGridItem {
    justify-content: space-between;
    width: 100%;
}

.desciconLarge {
    width: 5px;
    height: 18px;
    margin-top: 4px;
    margin-right: 8px;
    float: left;
    background: #84B7F9;
}
</style>
