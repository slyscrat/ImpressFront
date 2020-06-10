<template>
    <div>
        <a
                style="color: blue; cursor: pointer;"
                onmouseover="this.style.color='red'"
                onmouseout="this.style.color='blue'"
                @click="back"
        >
            Назад
        </a>
        <div> <!--:renderKey="itemId">-->
            <span>{{item.name}}</span>
            <span>({{new Date(item.releaseDate).getFullYear()}})</span>

            <div>
                <img :src="images.mark" class="smallImg" @click="future"
                     :class="{ forFuture: this.rating === 0,
                     notForFuture: this.rating !== 0,
                     clickable: this.$store.getters['security/token'].length > 0}" />
                <span @click="rate">
                    <starRating :star-size="30" v-model="rating" :show-rating="false"
                                :read-only="this.$store.getters['security/token'].length === 0"/>
                </span>
            </div>
            <span v-if="this.item.duration > 0">Длительность: {{duration}}</span>
            <img :src="this.source + this.item.icon" class="rounded"/>
            <span>Описание{{item.description}}</span>
            <span>Жанр {{genres}}</span>
            <span>Производственный состав {{crew}}</span>
            <span>Актеры {{actors}}</span>
            <div v-if="isAuthorized">
                Моя заметка
                <span v-if="showMessage">У произведения есть заметка, поэтому оно отмечено Отложенным</span>
                <b-input v-model="noteInput"></b-input>
                <b-button v-if="oldNoteInput !== noteInput">Сохранить</b-button>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import {API_SERVER_PATH, LARGE_MOVIE_IMG} from "@/utils/constants";
    import starRating from "vue-star-rating";
    // TODO : also call popUp
    export default {
        name: "ItemView",
        components: {
            starRating
        },
        data() {
            return {
                showMessage: false,
                oldNoteInput: '',
                noteInput: '',
                isAuthorized: false,
                item: {},
                rating: -1,
                oldRating: -1,
                source: "",
                itemId: this.$route.params.id,
                itemType: "",
                images: {
                    mark: require('@/assets/static/0_bookmark.png'),
                    book: require('@/assets/static/0_book.png')
                }
            }
        },
        computed: {
            duration() {
                let time = '';
                let hours = Math.trunc(this.item.duration / 60);
                let minutes = this.item.duration - hours * 60;
                if (hours === 1) time = '1 час ';
                // eslint-disable-next-line no-empty
                else if (hours < 1){}
                else time = hours + ' часа ';
                time += minutes
                if (minutes.toString().endsWith('2')
                    || minutes.toString().endsWith('3')
                    || minutes.toString().endsWith('4'))
                    time += ' минуты';
                else
                    time += ' минут';
                return time;
            },
            genres() {
                return this.arrayWork('genres').toLowerCase();
            },
            crew() {
                return this.arrayWork('team');
            },
            actors() {
                return this.arrayWork('actors');
            }
        },
        methods: {
            arrayWork(property) {
                let result = '';
                if (this.item.length > 0)
                    this.item[property].forEach((prop) => {
                        result = result + prop.name + ", "
                    })
                if (result.length === 0) result = '-';
                else result = result.substring(0, result.length - 2);
                return result;
            },
            back() {
                this.$emit('fetch');
                this.$router.go(-1);
            },
            rate() {
                axios.post(API_SERVER_PATH + `/${this.itemType}/${this.itemId}/rate`, this.rating, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then((response) => {
                    if (this.oldRating >= 0 && response.data.rate === 0) {
                        this.showMessage = true;
                        setTimeout(() => this.showMessage = false, 4000);
                    }
                    this.rating = response.data.rate;
                    this.oldRating = this.rating;
                }).catch((error) => {
                    console.log(error);
                });
            },
            future() {
                axios.post(API_SERVER_PATH + `/${this.itemType}/${this.itemId}/rate`, 0, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then((response) => {
                    console.log('RESPONSED FUT');
                    this.rating = response.data.rate;
                }).catch((error) => {
                    console.log(error);
                });
            },
            note() {
                //this.noteInput = this.response ALSO check done and so on
                // if noteInput.length === 0 and this.item.note.length > 0 send noteDel
            },
            authorityCheck() {
                return this.$store.getters['security/token'].length > 0;
            }
        },
        mounted() {
            this.isAuthorized = this.authorityCheck();
            let location = this.$router.history.getCurrentLocation();
            this.itemType = location.includes('movie') ? 'movie' :
                location.includes('game') ? 'game' :
                    location.includes('book') ? 'book' : '';
            if (this.itemType === 'movie') this.source = LARGE_MOVIE_IMG;
            console.log(this.$store.getters['security/token']);
            axios.get(API_SERVER_PATH + `/${this.itemType}/${this.itemId}`, {
                headers: {
                    'Authorization': 'Bearer ' + this.$store.getters['security/token']
                },
            }).then((response) => {
                console.log('RECEIVED ITEM VIEW DATA');
                console.log(response.data);
                this.item = response.data;
                this.noteInput = this.item.note;
                console.log("NOTE IS");
                console.log(this.item.note);
                this.rating = this.item.rate;
                this.oldRating = this.item.rate;
                this.oldNoteInput = this.noteInput;
            }).catch((error) => {
                console.log(error);
            });
        }
    }
</script>

<style scoped>
    .rounded {
        border-radius: 50px;
    }

    .smallImg {
        width: 1.8%
    }

    .forFuture {
        opacity: 1;
    }

    .notForFuture {
        opacity: 0.5;
    }

    .clickable {
        cursor: pointer;
    }

    .myCard {
        width: 220px;
        height: 430px;
    }
</style>