<template>
    <div class="student-container">
        <b-navbar toggleable="lg" type="dark" variant="dark">
<!--            <b-navbar-brand href="#">
                <img src="https://placekitten.com/g/30/30" alt="Kitten">
            </b-navbar-brand>-->
            <img :src="images.logo" style="cursor:pointer" @click="$router.push('/movie/list')"/>

            <b-navbar-nav class="notes" fill>
                <b-nav-item exact
                            exact-active-class="active"
                            to="/movie/list"
                >
                    Фильмы
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            to="/game/list"
                >
                    Игры
                </b-nav-item>
                <b-nav-item exact
                            exact-active-class="active"
                            to="/book/list"
                >
                    Книги
                </b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav>
                <form class="form-inline" v-on:keydown.enter.prevent="search">
                    <input class="form-control mr-sm-2" type="text" placeholder="Поиск" v-model="searchData">
                    <b-button @click="search" class="text-hide">
                        <img :src="images.search"/>
                    </b-button>
                </form>
            </b-navbar-nav>
            <b-navbar-nav class="fixedSize">
                <div v-if="!this.$store.getters['security/id']">
                    <b-button v-b-modal.loginModal class="my-button" ref="authBtn">
                        Войти
                    </b-button>
                    <b-button v-b-modal.registrationModal class="link" ref="regBtn">
                        Регистрация
                    </b-button>
                </div>
                <b-nav-item-dropdown v-else-if="this.$store.getters['security/id']" right>
                    <template v-slot:button-content>
                        {{user.nickName}}
                        <img :src="images.user" width="15%">
                    </template>
                    <b-dropdown-item disabled>
                        {{user.name}}
                    </b-dropdown-item>
                    <b-dropdown-item disabled>
                        {{user.email}}
                    </b-dropdown-item>
                    <b-dropdown-item @click="sendLogout">Выйти</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>

        </b-navbar>
<!--        <b-row>
            <b-alert :show="fetchError !== ''" variant="danger">
                {{fetchError}}
            </b-alert>
        </b-row>-->
        <router-view>
        </router-view>
        <loginModal @register="registration" @auth="reload"/>
        <registrationModal @auth="authorization"/>
    </div>
</template>

<script>
	import {mapMutations} from "vuex";
	import {LOGOUT} from "@/store/modules/security";
	import axios from "axios";
    import loginModal from '@/components/common/LoginModal'
    import registrationModal from '@/components/common/RegistrationModal'
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "UpperHeader",
        components: {
            loginModal,
            registrationModal
        },
		data() {
			return {
                searchData: "",
				user: {},
                page: 0,
                showModal: false,
                images: {
                    logo: require('@/assets/static/0_log.png'),
                    search: require('@/assets/static/0_searc.png'),
                    user: require('@/assets/static/0_user.png')
                },
				fetchError: ''
			}
		},
		methods: {
			...mapMutations('security', {
				logout: LOGOUT
			}),
            authorization() {
                this.$refs.authBtn.click();
            },
            registration() {
                this.$refs.regBtn.click();
            },
            sendLogout() {
                axios.post(API_SERVER_PATH + "/auth/logout", null, {
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    },
                }).then(() => {
                    this.logout();
                    this.user = {};
                }).catch((error) => {
                    console.log(error);
                });
            },
            sendLogin() {
                axios.get(API_SERVER_PATH + `/user/${this.$store.getters['security/id']}`, {
                        headers: {
                            'Authorization': 'Bearer ' + this.$store.getters['security/token']
                        }
                    }).then((response) => {
                        this.fetchError = '';
                        this.user = Object.assign({}, this.user, response.data);
                    }).catch((error) => {
                        if (error.response) {
                            this.fetchError = error.response.data;
                        } else if (error.request) {
                            this.fetchError = "Сервер не отвечает";
                        }
                    })
            },
            reload() {
                console.log("reload");
                if (this.$store.getters['security/oldId'] != this.$store.getters['security/id']) this.$forceUpdate();
            },
            search() {
                axios.get(API_SERVER_PATH + this.$router.history.getCurrentLocation() + '/search', {
                    params: {
                        q: this.searchData,
                        p: this.page
                    },
                    headers: {
                        'Authorization': 'Bearer ' + this.$store.getters['security/token']
                    }
                }).then((response) => {
                    console.log(response);
                    this.searchData = "";
                }).catch((error) => {
                    if (error.response) {
                        this.fetchError = error.response.data;
                    } else if (error.request) {
                        this.fetchError = "Сервер не отвечает";
                    }
                })
            }
		},
		mounted() {
            if (this.$store.getters['security/id']) {
                this.sendLogin();
            }
		},
        updated() {
            if (this.$store.getters['security/id'] && this.$store.getters['security/id'] != this.user.id) {
                this.sendLogin();
            }
        }
	}
</script>

<style scoped>
    .test {
        background-color: yellow;
    }

    .student-container {
        background-color: whitesmoke;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }

    .navbar-nav > li {
        float: left;
        position: relative;
    }

    input[type="text"],
    select.form-control {
        background: transparent;
        border: none;
        border-bottom: 1px solid chartreuse;
        -webkit-box-shadow: none;
        box-shadow: none;
        border-radius: 0;
        color: pink;
    }

    input[type="text"]:focus,
    select.form-control:focus {
        -webkit-box-shadow: none;
        box-shadow: none;
        color: red;
    }

    .navbar-nav .active::after {
        border-bottom: 5px solid #5bc0eb;
        bottom: -10px;
        content: " ";
        left: 0;
        position: absolute;
        right: 0;
    }

    .navbar {
        display: flex;
        flex-direction: row;
        align-content: space-between;
        justify-content: space-around;
    }

    .notes {
        display: flex;
        width: 50%;
        flex-direction: row;
        justify-content: space-between;
    }

    .fixedSize {
        width: 20%;
        background-color: green;
    }


    .fixed-size::after {
        display: none;
        content: none;
    }
</style>
