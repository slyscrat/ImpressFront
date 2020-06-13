<template>
    <div>
        <a
                style="color: #6d7f8f; cursor: pointer;"
                onmouseover="this.style.color='#BDD5EC'"
                onmouseout="this.style.color='#6d7f8f'"
                @click="back"
                id="backLink"
        >
            Назад
        </a>
        <div class="movieView">
            <div class="movieCard">
                <img :src="this.source + this.item.icon" class="myRounded" alt=""/>
                <div class="info">
                    <div class="itemHeader">
                        <div class="separate">
                                <div>
                                    <span style="font-size: 26px; font-weight: bold">{{item.name}}</span>
                                    <span style="font-size: 26px">({{new Date(item.releaseDate).getFullYear()}})</span>
                                </div>
                                <span v-if="showMessage">У произведения есть заметка, поэтому оно отмечено Отложенным</span>
                        </div>
                        <div id="rates">
                            <div id="duration" style="font-size: 18px">
                                <div>Длительность: {{duration}}</div>
                            </div>
                            <img :src="images.mark" class="smallImg" @click="future"
                                 :class="{ forFuture: this.rating === 0,
                                 notForFuture: this.rating !== 0,
                                 clickable: this.$store.getters['security/token'].length > 0}"
                                 @mouseover="changeClass"
                                 @mouseout="changeClass"
                             alt=""/>
                            <span @click="rate">
                                <starRating :star-size="30" v-model="rating" :show-rating="false"
                                            :read-only="this.$store.getters['security/token'].length === 0"/>
                            </span>
                        </div>
                    </div>

                    <div id="textForm">
                        <div id="textData">
                            <p>Описание</p>
                            <span>{{item.description}}</span>
                            <p>Жанр</p>
                            <span>{{genres}}</span>
                            <p>Производственный состав</p>
                            <span>{{crew}}</span>
                            <p>Актеры</p>
                            <span>{{actors}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="isAuthorized" id="noticeForm">
                <div id="noticeHeader">
                    <p>Моя заметка</p>
                    <b-button v-if="oldNoteInput !== noteInput" @click="note">Сохранить</b-button>
                </div>
                <b-form-textarea max-rows="3" no-resize rows="3" v-model="noteInput" id="notice" :formatter="cut"></b-form-textarea>
            </div>
        </div>
        <div :class="{myFooter: true, myFooterFixed: false}">
            2020 Дипломная работа Бутышкиса Ильи
        </div>
    </div>
</template>

<script>
    import axios from "axios";
    import {API_SERVER_PATH, LARGE_MOVIE_IMG} from "@/utils/constants";
    import starRating from "vue-star-rating";

    export default {
        name: "MovieView",
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
                source: LARGE_MOVIE_IMG,
                itemId: this.$route.params.id,
                images: {
                    mark: require('@/assets/static/0_bookmark.png')
                }
            }
        },
        computed: {
            duration() {
                let time = '-';
                if (this.item.duration > 0) {
                    time = '';
                    let hours = Math.trunc(this.item.duration / 60);
                    let minutes = this.item.duration - hours * 60;
                    if (hours === 1) time = '1 час ';
                    else if (hours > 1) time = hours + ' часа ';
                    time += minutes
                    if (minutes.toString().endsWith('2')
                        || minutes.toString().endsWith('3')
                        || minutes.toString().endsWith('4'))
                        time += ' минуты';
                    else
                        time += ' минут';
                }
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
            cut(inputStr) {
                return String(inputStr).substring(0,255);
            },
            arrayWork(property) {
                let result = '';
                if (typeof this.item[property] !== "undefined")
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
                axios.post(API_SERVER_PATH + `/movie/${this.itemId}/rate`, this.rating, {
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
                axios.post(API_SERVER_PATH + `/movie/${this.itemId}/rate`, 0, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then((response) => {
                    this.rating = response.data.rate;
                }).catch((error) => {
                    console.log(error);
                });
            },
            note() {
                let noteUrl = API_SERVER_PATH + `/movie/${this.itemId}/note` + (this.noteInput.length > 0 ?
                    '' : '/del');
                axios.post(noteUrl, encodeURI(this.noteInput), {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then((response) => {
                    if (typeof response.data === 'string')
                        this.noteInput = '';
                    else
                        this.noteInput = decodeURI(response.data.note);
                    this.oldNoteInput = this.noteInput;
                }).catch((error) => {
                    console.log(error);
                });
            },
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
            authorityCheck() {
                return this.$store.getters['security/token'].length > 0;
            }
        },
        mounted() {
            this.isAuthorized = this.authorityCheck();
            axios.get(API_SERVER_PATH + `/movie/${this.itemId}`, {
                headers: {
                    'Authorization': 'Bearer ' + this.$store.getters['security/token']
                },
            }).then((response) => {
                this.item = response.data;
                this.noteInput = this.item.note;
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

    p {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: -3px;
        margin-top: 4px;
    }

    .myRounded {
        border-radius: 10px;
        box-shadow: 5px 0 10px 0;
    }

    .smallImg {
        width: 24px;
        height: 34.5px;
    }

    .movieView {
        padding: 9% 7.8%;
    }

    .movieCard {
        display: flex;
        flex-direction: row;
    }

    .myFooterFixed {
        position: fixed;
    }

    .myFooter,
    .myFooterFixed {
        bottom: 0;
        color: #BDD5EC;
        background-color: #1e2a32;
        text-align: right;
        padding-right: 5%;
        width: 100%;
        height: 25px;
    }

    .info {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        color: #eadcc7;
        width: 100%;
    }

    #noticeHeader {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 15px;
        margin-top: 20px;
        height: 40px;
        color: #eadcc7;
    }

    button {
        height: 40px;
        width: 200px;
        background-color: #253139;
        border: none;
        color: #eadcc7;
    }

    button:hover {
        color: #fff
    }

    #textForm {
        background-color: #7a8c9c;
        color: #eadcc7;
        border-radius: 10px;
        margin-left: -12px;
        z-index: -1;
        min-height: 50%;
    }

    #textData {
        margin-left: 32px;
        padding-right: 20px;
    }

    .itemHeader {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: 20px;
        margin-bottom: 30px;
    }

    #rates {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    #duration {
        width: 77%;
    }

    .separate {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    #notice{
        background-color: #253139;
        border: none;
        color: #eadcc7;
    }

    #backLink {
        position: fixed;
        margin: 9% 2%;
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