<template>
  <div>
    <div class="commentArea scrollbar">
      <div id="comment"></div>
    </div>
    <div class="fontrogo">ゆ</div>
  </div>
</template>

<script>
export default {
  props: ["comment"],
  watch: {
    comment: function (newData, oldData) {
      this.addComment(newData);
    },
  },
  methods: {
    addComment(comment) {
      let element1 = document.createElement("div");
      element1.classList.add("slidein");
      element1.classList.add("kaiwa");
      element1.classList.add("line");

      let element2 = document.createElement("div");
      element2.classList.add("name");
      element2.textContent = comment.name;

      let element3 = document.createElement("div");
      element3.classList.add("fukidasi");
      element3.classList.add("left");

      let giftImgElement = document.createElement("img");
      giftImgElement.classList.add("icon");
      giftImgElement.classList.add("jump");
      giftImgElement.src = comment.avatar;

      // こんゆきの～
      if (
        comment.comment == "こんゆきの" ||
        comment.comment == "こんゆきの～" ||
        comment.comment == "こんゆきの〜❄️"
      ) {
        element3.classList.add("stamp");
        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/kon.png");
        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else if (
        comment.comment == "おつゆきの" ||
        comment.comment == "おつゆきの～"
      ) {
        element3.classList.add("stamp");
        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/otu.png");
        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else if (comment.comment == "ビール") {
        element3.classList.add("stamp");
        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/oi.png");
        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else if (
        comment.comment == "おはゆきの" ||
        comment.comment == "おはゆきの～"
      ) {
        element3.classList.add("stamp");
        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/oha.png");
        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else if (
        comment.comment == "ネコ" ||
        comment.comment == "ねこ" ||
        comment.comment == "猫"
      ) {
        element3.classList.add("stamp");

        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/neko.png");

        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else if (
        comment.comment == "クマ" ||
        comment.comment == "くま" ||
        comment.comment == "熊"
      ) {
        element3.classList.add("stamp");
        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/kuma.png");
        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else if (comment.comment == "アイス") {
        element3.classList.add("stamp");
        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/ice.png");
        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else if (comment.comment == "ｵﾅｶｽｲﾀ…") {
        element3.classList.add("stamp");
        let stampElement = document.createElement("img");
        stampElement.width = "200";
        stampElement.src = require("@/assets/image/onaka.png");
        element1.append(element2);
        element1.append(element3);
        element3.append(stampElement);
        element3.append(giftImgElement);
      } else {
        element3.textContent = comment.comment;

        element1.append(element2);
        element1.append(element3);
        element3.append(giftImgElement);
      }

      let myMain = document.getElementById("comment");
      myMain.parentNode.insertBefore(element1, myMain.nextElementSibling);
    },
  },
};
</script>

<style>
.scrollbar {
  overflow: scroll;
}

.scrollbar::-webkit-scrollbar {
  display: none;
}

.fontrogo {
  font-family: "rogotype" !important;
  color: rgba(0, 0, 0, 0);
}

.commentArea {
  margin-top: 17vh;
  margin-right: 67px;
  float: right;
  width: 19vw;
  height: 57vh;
  font-family: "rogotype";
}

.stamp {
  background: initial !important;
}
.stamp::after {
  box-shadow: initial !important;
}

.slidein {
  animation: slideIn 1s cubic-bezier(0.25, 1, 0.5, 1) 1 forwards;
}

@keyframes slideIn {
  0% {
    transform: translateX(180px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
  }
  40%,
  100% {
    opacity: 1;
  }
}

.jump {
  animation-name: jump;
  animation-iteration-count: 2;
  animation-duration: 0.5s;
}

@keyframes jump {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.kaiwa.line {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 10px 0;
  font-family: "rogotype" !important;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
}

.kaiwa.line .fukidasi {
  position: relative;
  display: inline-block;
  max-width: 273px;
  margin: 8px 0 0;
  padding: 9px 14px;
  border-radius: 19px;
  overflow-wrap: break-word;
  clear: both;
  box-sizing: content-box; /*はてな用*/
}

.kaiwa.line .fukidasi.left {
  float: left;
  margin-left: 62px;
  background: rgb(241, 241, 241);
}

.kaiwa.line .name + .fukidasi.left {
  font-size: 25px;
  margin-top: 15px;
}

.kaiwa.line .name {
  clear: right;
  font-size: 20px;
  margin-left: 62px;
  color: black;
}

.kaiwa.line .icon {
  margin-top: 10px;
  position: absolute;
  width: 50px;
  height: 50px;
  left: -54px;
  top: -2px;
}

.kaiwa.line .name + .left .icon {
  top: -1.8em;
}

.kaiwa.line .fukidasi::after {
  position: absolute;
  content: "";
  width: 24px;
  height: 36px;
  top: -21px;
}

.kaiwa.line .fukidasi.left:after {
  left: -10px;
  border-radius: 18px 0 6px 18px/18px 0 1px 18px;
  box-shadow: -3px -15px 0 -5px rgb(241, 241, 241) inset;
}

.kaiwa.line .left + .left::after {
  content: none;
}
</style>