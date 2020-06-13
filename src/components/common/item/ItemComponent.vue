<template>
    <div>
        <div :class="{myCard: itemType !== 'game', gameCard: itemType === 'game'}" :item="item">
            <img :src="this.source + this.item.icon" class="clickable" :class="this.itemType" @click="openItem" alt=""/>
            <div :class="{images: itemType !== 'game', gameImages: itemType === 'game'}">
                <img :src="images.mark" class="smallImg" @click="future"
                     :class="{ forFuture: this.rating === 0,
                     notForFuture: this.rating !== 0,
                     clickable: this.$store.getters['security/token'].length > 0,
                     }"
                     @mouseover="changeClass"
                     @mouseout="changeClass"
                 alt=""/>
                <span @click="rate">
                    <starRating :star-size="25" v-model="rating" :show-rating="false"
                                :read-only="this.$store.getters['security/token'].length === 0" :class="{star: itemType === 'game'}"/>
                </span>
            </div>
            <span class="clickable myText" @click="openItem">{{this.item.name}}</span>
        </div>
    </div>
</template>

<script>
    import {SMALL_MOVIE_IMG} from "@/utils/constants"
    import starRating from "vue-star-rating";

    export default {
        name: "ItemComponent",
        props: ['item'],
        components: {
            starRating
        },
        data() {
            return {
                clicked: false,
                source: "",
                itemType: "",
                rating: -1,
                oldRating: -1,
                images: {
                    mark: require('@/assets/static/0_bookmark.png'),
                    book: require('@/assets/static/0_book.png')
                }
            }
        },
        watch: {
            item: function () {
                this.rating = this.item.rate;
            }
        },
        mounted() {
            this.source = '';
            let type = this.$router.history.getCurrentLocation();
            type = type.substring(1);
            this.itemType = type.substring(0, type.indexOf('/'));
            if (this.itemType === 'movie') this.source = SMALL_MOVIE_IMG;
            if (this.itemType === 'book' && this.item.icon.includes('cdn')) this.item.icon = this.images.book;
            this.rating = this.item.rate;
            this.oldRating = this.item.rate;
        },
        methods: {
            swapClass(element) {
                element.className = element.className.includes('forFuture') ?
                    element.className.replace('forFuture','notForFuture') :
                    element.className.replace('notForFuture', 'forFuture');
            },
            changeClass(event) {
                if (!event.target.className.includes('clickable')) return;
                if (event.type === 'mouseover')
                    this.swapClass(event.target);
                else {
                    if (!this.clicked) this.swapClass(event.target);
                    this.clicked = false;
                }
            },
            future() {
                this.clicked = !this.clicked;
                if (!this.authorityCheck()) return false;
                if (this.rating > 0) return false;
                this.$emit('fut', this.itemType, this.item.id);
            },
            openItem() {
                this.$emit('openItem', this.item.id);
            },
            rate() {
                if (!this.authorityCheck()) return false;
                if (this.rating > 5 || this.rating < 0) return false;
                console.log("ITEM RATE " + this.rating);
                this.$emit('rat', this.itemType, this.item.id, this.rating, this.oldRating);
            },
            authorityCheck() {
                return this.$store.getters['security/token'].length > 0;
            }
        }
    }
</script>

<style scoped>
    .movie, .book {
        width: 220px;
        height: 320px;
    }

    .movie,
    .book,
    .game {
        border-radius: 10px;
    }

    .gameCard {
        width: 460px;
        heigth: 300px;
        margin-bottom: 30px;
    }

    .smallImg {
        width: 18px;
        padding-top: 0.5px;
    }

    .forFuture {
        opacity: 1;
    }

    .notForFuture {
        opacity: 0.5;
    }

    .star {
        margin-left: 30px;
    }

    .gameImages {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-top: 10px;
        margin-bottom: 10px;
        height: 26px;
    }

    .images {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        margin-top: 10px;
        margin-bottom: 10px;
        height: 26px;
    }

    .myText {
        text-align: center;
        overflow: hidden;
        color: #eadcc7;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .clickable {
        cursor: pointer;
    }

    .myCard {
        width: 220px;
        height: 430px;
    }
</style>