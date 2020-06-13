<template>
    <b-modal class="login-container" id="loginModal"
    hide-footer hide-header :show="this.$store.getters['helpers/authorization']">
        <b-form>
            <b-row class="login-form-elem">
                <b-col class="text-center">
                    <h4>
                        Авторизация
                    </h4>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="E-mail">
                        <b-input id="username-input"
                                 type="text"
                                 v-model="email"
                                 @click="clearError"
                                 @change="checkEmail"
                                 @mouseleave="checkEmail"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="eyeInput" prepend="Пароль">
                        <b-input id="password-input"
                                 :type="passwordShow"
                                 v-model="password"
                                 @click="clearError"
                                 style="border-top-right-radius: 0.25rem; border-bottom-right-radius: 0.25rem"
                        />
                        <img ref="confirmEye" type="confirm" :src="images.closed" @click="switchVisibility" alt="">
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col class="text-center">
                    <a
                            style="color: #6d7f8f; cursor: pointer;"
                            onmouseover="this.style.color='#BDD5EC'"
                            onmouseout="this.style.color='#6d7f8f'"
                            @click="registration"
                            type="submit"
                    >
                        Нет аккаунта?
                    </a>
                    <b-button @click="performLogin"
                              size="lg"
                              type="submit"
                              v-if="!authenticationInProgress"
                    >
                        Войти
                    </b-button>
                    <b-spinner label="Spinning" type="grow" v-else variant="primary"/>
                </b-col>
            </b-row>
            <b-row class="login-form-elem" v-if="authenticationError.length > 0">
                <b-col class="text-center" offset="1" sm="10">
                    <b-alert :show="authenticationError.length > 0" variant="danger">{{authenticationError}}</b-alert>
                </b-col>
            </b-row>
        </b-form>
    </b-modal>
</template>

<script>
    import {API_SERVER_PATH, ROLE_ADMIN, ROLE_USER} from "@/utils/constants";
    import axios from "axios";
    import {AUTHENTICATE, LOGOUT} from "@/store/modules/security";
    import {mapMutations} from "vuex";

    export default {
        name: "LoginModal",
        data() {
            return {
                email: "",
                password: "",
                passwordShow: "password",
                authenticationError: "",
                authenticationInProgress: false,
                images: {
                    open: require('@/assets/static/0_eye_open.png'),
                    closed: require('@/assets/static/0_eye_close.png')
                }
            }
        },
        methods: {
            ...mapMutations('security', {
                authenticate: AUTHENTICATE,
                logout: LOGOUT
            }),
            clearError(){
                this.authenticationError = "";
            },
            checkEmail() {
                if (!this.email.match('^([A-Za-z1-9]{1,})[@]([A-Za-z]{1,})[.]([A-Za-z]{1,})$')) this.authenticationError = "Неправильный адрес почты";
                else this.authenticationError = "";
            },
            closeModal() {
                this.email = "";
                this.password = "";
                this.$nextTick(() => {
                    this.$bvModal.hide('loginModal');
                })
            },
            switchVisibility(event) {
                let hide = event.target.src === this.images.open;
                event.target.src = hide ? this.images.closed : this.images.open;
                this.passwordShow = hide ? "password" : "text";
            },
            registration() {
                this.$emit('register', true);
                this.closeModal();
            },
            performLogin(event) {
                event.preventDefault();
                if (this.authenticationError.length > 0) return false;
                this.authenticationInProgress = true;
                axios.post(API_SERVER_PATH + "/auth/login", {
                    email: this.email,
                    password: this.password
                }).then((response) => {
                    this.authenticationInProgress = false;
                    this.authenticate({
                        oldId: this.$store.getters['security/id'],
                        id: response.data['userId'],
                        email: this.email,
                        password: this.password,
                        role: response.data['userId'] === 1 ? ROLE_ADMIN : ROLE_USER,
                        token: response.data['token'],
                    });
                    this.$emit('auth', true);
                    this.closeModal();
                }).catch((error) => {
                    this.authenticationInProgress = false;
                    if (error.response)
                        this.authenticationError = "Неверный логин или пароль. Попробуйте еще раз";
                    else if (error.request)
                        this.authenticationError = "Сервер не отвечает";
                    this.logout();
                });
            }
        }
    }
</script>

<style scoped>
    img {
        width: 28px;
        height: 13%;
        cursor:pointer;
        margin-left: 20px;
        margin-top: 1.5%;
    }

    a {
        margin-right: 30px;
    }

    .login-container {
        border-radius: 30px;
        padding: 2% 0;
        margin: 5% 35%;
        background-color: whitesmoke;
        width: 30%;
    }

    .input-group .input-group-text {
        width: 100%;
        justify-content: center;
    }

    .login-form-elem {
        padding: 10px 0 5px 0;
        margin: 10px;
    }

    .eyeInput {
        width: 114.5%;
    }

    .input-group-prepend {
        width: 100px;
    }

    button {
        color: #eadcc7;
        background-color: #6d7e8c;
        height: 45px;
    }

    button:focus {
        background-color: #546f87;
        color: #eadcc7;
    }

    button:hover {
        background-color: #889bac;
        color: #eadcc7;
    }

</style>