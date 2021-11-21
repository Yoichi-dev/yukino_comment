<template>
  <div class="bgimg" id="gift">
    <FreeGift :freeGiftList="freeGiftList" />
    <PreGift :preGiftList="preGiftList" />
    <CommentSub :commentData="commentData" />
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      roomId: "369223",
      telop: "",
      commentData: [],
      freeGiftList: [],
      preGiftList: [],
      streamData: null,
      socket: null,
      checkStreaming: null,
    };
  },
  head() {
    return {
      title: "雪乃クリスタル専用コメントビューワー",
    };
  },
  mounted() {
    // パラメータがある場合はテスト
    if (this.$route.query.id != undefined) {
      this.roomId = this.$route.query.id;
    }
    // 疎通確認
    // this.checkStreaming = setInterval(() => {
    //   this.checkLive();
    // }, 5000);
    this.checkLive();
  },
  methods: {
    async checkLive() {
      let flg = false;
      let preFlg = false;
      // 配信しているか確認
      await axios
        .get(`${process.env.API_URL}/api/users/${this.roomId}`)
        .then((response) => {
          if (response.data.is_onlive) {
            // プレミアライブ中か？
            if (response.data.premium_room_type == 1) {
              preFlg = true;
            } else {
              flg = true;
              clearInterval(this.checkStreaming);
            }
          } else {
            console.log("配信停止中");
          }
        });

      if (preFlg) {
        await axios
          .get(`${process.env.API_URL}/api/users/onlive/${this.roomId}`)
          .then((response) => {
            if (response.data.length != undefined) {
              if (response.data) {
                this.streamData = response.data[0];
                clearInterval(this.checkStreaming);
                // 接続
                this.connectSocket();
              }
            }
          });
      } else if (flg) {
        // 配信情報取得
        await this.getLiveData();
        // 接続
        this.connectSocket();
      }
    },
    async getLiveData() {
      await axios
        .get(`${process.env.API_URL}/api/users/live/${this.roomId}`)
        .then((response) => {
          this.streamData = response.data;
          this.title = response.data.room_name;
        });
    },
    connectSocket() {
      console.log("接続開始");
      // 接続
      this.socket = new WebSocket("wss://online.showroom-live.com");
      // 接続確認
      this.socket.onopen = (e) => {
        this.socket.send("SUB\t" + this.streamData.bcsvr_key);
        console.log("コネクションを開始しました");
      };
      // エラー発生時
      this.socket.onerror = (error) => {
        // alert("エラーが発生しました\nページをリロードしてください");
        location.reload();
      };
      // 疎通確認
      setInterval(() => {
        this.socket.send("PING\tshowroom");
      }, 60000);
      // メッセージ受信
      this.socket.onmessage = (data) => {
        // 死活監視
        if (data.data === "ACK\tshowroom") {
          console.log("死活監視OK");
          return;
        }

        if (data.data === "ERR") {
          // alert("エラーが発生しました\nページをリロードしてください");
          location.reload();
          return;
        }

        // JSON変換
        let getJson = JSON.parse(
          data.data.split("MSG\t" + this.streamData.bcsvr_key)[1]
        );

        if (Object.keys(getJson).length === 9) {
          // コメントログ
          // カウント
          let commentFormat = getJson.cm.replace(/[０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
          });
          if (
            Number.isFinite(Number(commentFormat)) &&
            Number(commentFormat) <= 50
          ) {
            // this.getCount(getJson);
          } else {
            this.getComment(getJson);
          }
        } else if (Object.keys(getJson).length === 12) {
          // ギフトログ
          if (getJson.gt == 2) {
            // 投票
            if (Number(getJson.g) > 10000 && Number(getJson.g) <= 10070) {
            } else if (getJson.g == 1601) {
              // 虹星
              this.giftPre(getJson);
            } else {
              // 無料
              this.giftFree(getJson);
            }
          } else {
            // 有料
            this.giftPre(getJson);
          }

          // this.fallGift(getJson);
        } else if (Object.keys(getJson).length === 5) {
          // テロップ
          this.telop = getJson.telop;
        } else if (Object.keys(getJson).length === 4) {
          if (getJson.t == 101) {
            this.socket.close();
            // alert("配信が終了しました");
            location.reload();
          }
        } else {
        }
      };
    },
    getComment(commentObj) {
      if (commentObj.cm != undefined) {
        if (commentObj.u == "3699368") {
          // 管理者機能
          let msg = commentObj.cm.split("_");
          if (msg[0] === "g") {
            this.fallAdminGift(commentObj.u, msg[1], msg[2]);
          } else {
            this.commentData = {
              id: commentObj.u,
              name: commentObj.ac,
              comment: commentObj.cm,
              flg: commentObj.ua,
              avatar: commentObj.av,
            };
          }
        } else {
          this.commentData = {
            id: commentObj.u,
            name: commentObj.ac,
            comment: commentObj.cm,
            flg: commentObj.ua,
            avatar: commentObj.av,
          };
        }
      }
    },
    giftFree(giftObj) {
      // 既に存在するか確認
      if (this.freeGiftList.some((e) => e.id == giftObj.u)) {
        for (let i in this.freeGiftList) {
          if (this.freeGiftList[i].id === giftObj.u) {
            this.freeGiftList[i].num += giftObj.n;
            this.freeGiftList[i].gitId = giftObj.g;
            this.freeGiftList[i].name = giftObj.ac;
            this.freeGiftList[i].avatar = giftObj.av;
          }
        }
        // TODO
        let freeGiftData = null;

        this.freeGiftList.some((val, i) => {
          if (val.id == giftObj.u) {
            freeGiftData = val;
            this.freeGiftList.splice(i, 1);
          }
        });

        // 先頭に追加
        this.freeGiftList.unshift(freeGiftData);
      } else {
        this.freeGiftList.unshift({
          id: giftObj.u,
          name: giftObj.ac,
          gitId: giftObj.g,
          num: giftObj.n,
          flg: giftObj.ua,
          avatar: giftObj.av,
        });
      }
    },
    giftPre(giftObj) {
      console.log(giftObj);
      if (
        this.preGiftList.some(
          (e) => e.id === giftObj.u && e.gitId === giftObj.g
        )
      ) {
        for (let i in this.preGiftList) {
          if (
            this.preGiftList[i].id === giftObj.u &&
            this.preGiftList[i].gitId === giftObj.g
          ) {
            this.preGiftList[i].num += giftObj.n;
            this.preGiftList[i].name = giftObj.ac;
            this.preGiftList[i].avatar = giftObj.av;
          }
        }
        let preGiftData = null;
        this.preGiftList.some((val, i) => {
          if (val.id === giftObj.u && val.gitId === giftObj.g) {
            preGiftData = val;
            this.preGiftList.splice(i, 1);
          }
        });
        this.preGiftList.unshift(preGiftData);
      } else {
        this.preGiftList.unshift({
          id: giftObj.u,
          name: giftObj.ac,
          gitId: giftObj.g,
          num: giftObj.n,
          flg: giftObj.ua,
          avatar: giftObj.av,
        });
      }
      console.log(this.preGiftList);
    },
  },
};
</script>

<style scoped>
.bgimg {
  width: 1920px;
  height: 1080px;
  background-image: url("~/assets/image/bg1.png");
}
</style>