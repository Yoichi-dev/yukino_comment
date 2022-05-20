<template>
  <div class="bgimg" id="gift">
    <FreeGift :freeGiftList="freeGiftList" />
    <PreGift :preGiftList="preGiftList" />
    <CommentSub :commentData="commentData" />
  </div>
</template>

<script>
import axios from "axios";
import constants from "~/constants";

export default {
  data() {
    return {
      roomId: "294615",
      roomUrl: "/Yukino0102",
      ws: "wss://online.showroom-live.com",
      telop: "",
      bcsvr_key: "",
      commentData: [],
      giftData: [],
      freeGiftList: [],
      preGiftList: [],
      streamData: null,
      socket: null,
      checkStreaming: null,
      checkPing: null,
      startTime: null,
      showFlg: true,
      fallFlg: false,
      pon: 0,
      sansyuCount: 0,
      kasoFlg: false,
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
    if (this.$route.query.watch != undefined) {
      this.showFlg = false;
    }
    if (this.$route.query.counter != undefined) {
      this.kasoFlg = true;
    }

    // 疎通確認
    // this.checkStreaming = setInterval(() => {
    //   this.checkLive();
    // }, 5000);

    // ソケット接続
    setTimeout(() => {
      this.getApi(
        `${constants.url.main}${constants.url.other.broadcast}${this.roomUrl}`
      )
        .then((res) => {
          if (!Object.keys(res.data).length) {
            this.premiumLive();
          } else if (res.data.split(":").length === 2) {
            // 配信中
            this.bcsvr_key = res.data;
            this.normalLive();
          } else {
            this.prConnectSocket(res.data);
          }
        })
        .catch((e) => {
          console.log(e);
          console.log("プレミアム配信かも？");
          this.premiumLive();
        });
    }, 1000);
  },
  methods: {
    async normalLive() {
      await axios
        .get(`${constants.url.main}${constants.url.room.profile}${this.roomId}`)
        .then((response) => {
          if (response.data.is_onlive) {
            this.startTime = response.data.current_live_started_at;
            // 配信情報取得
            this.getLiveData();
            // 接続
            this.connectSocket();
          }
        });
    },
    premiumLive() {
      this.checkStreaming = setInterval(() => {
        axios
          .get(`${constants.url.main}${constants.url.live.premium}`)
          .then((response) => {
            if (response.data.length != undefined) {
              if (response.data) {
                console.log(response.data);
                this.bcsvr_key = response.data[0].bcsvr_key;
                this.streamData = response.data[0];
                clearInterval(this.checkStreaming);
                // 接続
                this.connectSocket();
              }
            }
          });
      }, 5000);
    },
    async getLiveData() {
      await axios
        .get(
          `${constants.url.main}${constants.url.live.liveInfo}${this.roomId}`
        )
        .then((response) => {
          this.streamData = response.data;
          this.title = response.data.room_name;
        });
    },
    getApi(url) {
      return axios.get(url);
    },
    prConnectSocket(broadcastKey) {
      // 接続
      const prSocket = new WebSocket(this.ws);
      // 接続確認
      prSocket.onopen = (e) => {
        prSocket.send(`SUB\t${broadcastKey}`);
      };
      // エラー発生時
      prSocket.onerror = (e) => {
        prSocket.close();
        location.reload();
      };
      // 疎通確認
      this.checkPing = setInterval(() => {
        prSocket.send("PING\tshowroom");
      }, 60000);
      // メッセージ受信
      prSocket.onmessage = (data) => {
        // 死活監視
        if (data.data === "ACK\tshowroom") {
          return;
        }
        // エラー
        if (
          data.data === "ERR" ||
          data.data === "Could not decode a text frame as UTF-8."
        ) {
          return;
        }
        // JSON変換
        const getJson = JSON.parse(data.data.split(`MSG\t${broadcastKey}`)[1]);

        if (getJson.t === 104) {
          prSocket.close();
          clearInterval(this.checkPing);
          // 配信開始
          location.reload();
        }
      };
    },
    connectSocket() {
      console.log("接続開始");
      // 接続
      this.socket = new WebSocket(constants.ws);
      // 接続確認
      this.socket.onopen = (e) => {
        this.socket.send("SUB\t" + this.bcsvr_key);
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
        this.fallFlg = true;
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
        let getJson = JSON.parse(data.data.split("MSG\t" + this.bcsvr_key)[1]);

        if (Object.keys(getJson).length === 10) {
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
        } else if (Object.keys(getJson).length === 13) {
          // ギフトログ
          if (getJson.gt == 2) {
            // 投票
            if (Number(getJson.g) > 10000 && Number(getJson.g) <= 10070) {
            } else if (getJson.g == 1601) {
              // 虹星
              this.giftPre(getJson);
              this.fallGift(getJson);
            } else {
              // 無料
              this.giftFree(getJson);
              this.fallGiftFree(getJson);
            }
          } else {
            // 有料
            this.giftPre(getJson);
            this.fallGift(getJson);
          }

          // this.fallGift(getJson);
        } else if (Object.keys(getJson).length === 6) {
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
          if (commentObj.cm === "me") {
            this.fallMe(commentObj.u, commentObj.av, 100);
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
    },
    fallGiftFree(gift) {
      // 画面幅を取得
      let width = window.innerWidth;
      let height = window.innerHeight;

      // ギフトの数分ループ
      for (let i = 0; i < gift.n; i++) {
        // 要素のID
        let id = `gift_${gift.u}_${gift.g}_${i}`;
        // ギフト画像の要素を作成
        let giftImgElement = document.createElement("img");
        // 画像を設定
        if (i <= 5) {
          // giftImgElement.src = `~/assets/image/${i}.png`;
          giftImgElement.src = require(`@/assets/image/${i}.png`);
          giftImgElement.style.width = "50px";
        } else if (i == 10) {
          giftImgElement.src = `https://image.showroom-cdn.com/showroom-prod/image/avatar/${gift.av}.png?v=85`;
          giftImgElement.style.width = "50px";
        } else {
          giftImgElement.src = `https://image.showroom-cdn.com/showroom-prod/assets/img/gift/${gift.g}_s.png`;
        }

        // IDを設定
        giftImgElement.setAttribute("id", id);
        // 配置位置を設定
        giftImgElement.style.position = "absolute";
        giftImgElement.style.top = "-25px"; // 画面外に配置
        giftImgElement.style.left = this.getRandomNum(10, width - 70) + "px"; // ランダムに配置
        // ギフト要素を画面に追加
        document.getElementById("gift").append(giftImgElement);

        // 動きを追加
        // 動かす要素IDを指定
        gsap.to(`#${id}`, {
          duration: this.getRandomNum(2, 5), // 2秒～5秒の間で移動
          rotation: this.getRandomNum(90, 720), // 回転角度
          y: height - 60, // 落ちる高さ
          onComplete: () => {
            document.getElementById(id).remove(); // 終わったら要素を削除
          },
        });
      }
    },
    fallGift(gift) {
      // 画面幅を取得
      let width = window.innerWidth;
      let height = window.innerHeight;

      // ギフトの数分ループ
      for (let i = 0; i < gift.n; i++) {
        // 要素のID
        let id = `gift_${gift.u}_${gift.g}_${i}`;
        // ギフト画像の要素を作成
        let giftImgElement = document.createElement("img");
        // 画像を設定
        giftImgElement.src = `https://image.showroom-cdn.com/showroom-prod/assets/img/gift/${gift.g}_s.png`;
        giftImgElement.style.width = "100px";
        // IDを設定
        giftImgElement.setAttribute("id", id);
        // 配置位置を設定
        giftImgElement.style.position = "absolute";
        giftImgElement.style.top = "-25px"; // 画面外に配置
        giftImgElement.style.left = this.getRandomNum(10, width - 70) + "px"; // ランダムに配置
        // ギフト要素を画面に追加
        document.getElementById("gift").append(giftImgElement);

        // 動きを追加
        // 動かす要素IDを指定
        gsap.to(`#${id}`, {
          duration: this.getRandomNum(2, 5), // 2秒～5秒の間で移動
          rotation: this.getRandomNum(90, 720), // 回転角度
          y: height - 60, // 落ちる高さ
          onComplete: () => {
            document.getElementById(id).remove(); // 終わったら要素を削除
          },
        });
      }
    },
    fallMe(userId, img, num) {
      // 画面幅を取得
      let width = window.innerWidth;
      let height = window.innerHeight;

      // ギフトの数分ループ
      for (let i = 0; i < num; i++) {
        // 要素のID
        let id = `me_${userId}_${i}`;
        // ギフト画像の要素を作成
        let giftImgElement = document.createElement("img");
        // 画像を設定
        giftImgElement.src = `https://image.showroom-cdn.com/showroom-prod/image/avatar/${img}.png?v=85`;
        giftImgElement.style.width = "100px";
        // IDを設定
        giftImgElement.setAttribute("id", id);
        // 配置位置を設定
        giftImgElement.style.position = "absolute";
        giftImgElement.style.top = "-25px"; // 画面外に配置
        giftImgElement.style.left = this.getRandomNum(10, width - 70) + "px"; // ランダムに配置
        // ギフト要素を画面に追加
        document.getElementById("gift").append(giftImgElement);

        // 動きを追加
        // 動かす要素IDを指定
        gsap.to(`#${id}`, {
          duration: this.getRandomNum(2, 5), // 2秒～5秒の間で移動
          rotation: this.getRandomNum(90, 720), // 回転角度
          y: height - 60, // 落ちる高さ
          onComplete: () => {
            document.getElementById(id).remove(); // 終わったら要素を削除
          },
        });
      }
    },
    fallAther(userId, img, num, size) {
      // 画面幅を取得
      let width = window.innerWidth;
      let height = window.innerHeight;

      // ギフトの数分ループ
      for (let i = 0; i < num; i++) {
        // 要素のID
        let id = `pon_${userId}_${i}`;
        // ギフト画像の要素を作成
        let giftImgElement = document.createElement("img");
        // 画像を設定
        giftImgElement.src = require(`@/assets/image/${img}.png`);
        giftImgElement.style.width = `${size}px`;
        giftImgElement.style.zIndex = 100;
        // IDを設定
        giftImgElement.setAttribute("id", id);
        // 配置位置を設定
        giftImgElement.style.position = "absolute";
        giftImgElement.style.top = "-25px"; // 画面外に配置
        giftImgElement.style.left = this.getRandomNum(10, width - 70) + "px"; // ランダムに配置
        // ギフト要素を画面に追加
        document.getElementById("gift").append(giftImgElement);

        // 動きを追加
        // 動かす要素IDを指定
        gsap.to(`#${id}`, {
          duration: this.getRandomNum(2, 5), // 2秒～5秒の間で移動
          rotation: this.getRandomNum(90, 720), // 回転角度
          y: height - 60, // 落ちる高さ
          onComplete: () => {
            document.getElementById(id).remove(); // 終わったら要素を削除
          },
        });
      }
    },
    fallAdminGift(userId, gid, num) {
      // 画面幅を取得
      let width = window.innerWidth;
      let height = window.innerHeight;

      // ギフトの数分ループ
      for (let i = 0; i < num; i++) {
        // 要素のID
        let id = `gift_${userId}_${i}`;
        // ギフト画像の要素を作成
        let giftImgElement = document.createElement("img");
        // 画像を設定
        giftImgElement.src = `https://image.showroom-cdn.com/showroom-prod/assets/img/gift/${gid}_s.png`;
        giftImgElement.style.width = "100px";
        // IDを設定
        giftImgElement.setAttribute("id", id);
        // 配置位置を設定
        giftImgElement.style.position = "absolute";
        giftImgElement.style.top = "-25px"; // 画面外に配置
        giftImgElement.style.left = this.getRandomNum(10, width - 70) + "px"; // ランダムに配置
        // ギフト要素を画面に追加
        document.getElementById("gift").append(giftImgElement);

        // 動きを追加
        // 動かす要素IDを指定
        gsap.to(`#${id}`, {
          duration: this.getRandomNum(2, 5), // 2秒～5秒の間で移動
          rotation: this.getRandomNum(90, 720), // 回転角度
          y: height - 60, // 落ちる高さ
          onComplete: () => {
            document.getElementById(id).remove(); // 終わったら要素を削除
          },
        });
      }
    },
    getRandomNum(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.random() * (max - min + 1) + min;
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