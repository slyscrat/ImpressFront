<template>
    <div>
        <b-button @click="back">
            Назад
        </b-button>
    </div>
</template>

<script>
    export default {
        name: "ItemView",
        methods: {
            back() {
                this.$router.go(-1);
            }
        }
    }
</script>

<style scoped>

</style>