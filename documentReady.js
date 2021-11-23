let a = {

  // Is the DOM ready to be used? Set to true once it occurs.
  // DOM是否加載完畢
  isReady: false,

  // A counter to track how many items to wait for before
  // the ready event fires. See #6781
  // DOM加載完畢之前的等待次數
  readyWait: 1,
  /*
  Hold (or release) the ready event
  是否延遲觸發DOM ready？在jQuery中沒有任何地方有調用到holdReady，這是個遺留方法還
  是預留方法，有待繼續研究。  
  因此在當前版本中，readyWait總是1，直到自減
   */
  holdReady: function (hold) {
    if (hold) { // 繼續等待
      jQuery.readyWait++;
    } else {
      jQuery.ready(true); //
    }
  },

  /*
   Handle when the DOM is ready
   判斷DOM是否加載完畢，如果已完畢，調用DOM ready事件異步隊列readyList，如果未完，每
   個1ms檢查一次
   */
  ready: function (wait) { // jQuery.ready

    /*
     Either a released hold or an DOMready/load event and not yet ready// 條件1：wait === true && !--jQuery.readyWait 還在等待加載完成，但是等待計數
     器jQuery.readyWait已經是0，
     
     換句話說參數wait為true表示嘗試一下看是否能開始調用readyList了，如果發現計數器j
     Query.readyWait變成0，啥也不管了，開始調用吧
     
     再換句話說，計數器已經是0了，開干吧
     
     
     條件2：wait !== true && !jQuery.isReady 明確的說不用了，即使DOM ready標記
     還是false
     
     換句話說，及時DOM ready標記還是false，但是調用jQuery.ready的客戶端認為不比再
     等了，可以開幹了
     */
    if ((wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady)) {

      /*
       Make sure body exists, at least, in case IE gets a little overz
       ealous (ticket #5443).       
       檢查document.body是否存在，這是特定於IE的檢測，保證在IE中DOM ready事件
       能正確判斷
       */
      if (!document.body) {
        return setTimeout(jQuery.ready, 1);
      }

      // Remember that the DOM is ready
      // 到這裡，jQuery.isReady被強製為true
      // 在條件2中，如果jQuery.isReady為true，那麼說明readyList的狀態已經確定
      // 添加到readyList中的函數會被立即執行

      // 如果jQuery.isReady為是false，那麼接下來readyList中函數將被執行

      jQuery.isReady = true;

      // If a normal DOM Ready event fired, decrement, and wait if need be
      // 雖然上邊的條件2的意思是，別管其他情況，調用方認為ready了，但是這裡仍然做了防禦性檢測，如果等待計數器仍然大於1，結束ready調用
      // 如果這個條件成立，那麼一定是哪裡出問題了！

      // 在當前版本1.6.1中，這個判斷永遠不會成立
      // 因為沒有地方調用會使readyWait加一的holdReady

      if (wait !== true && --jQuery.readyWait > 0) {
        return;
      }
      //--------------------------------------
      // If there are functions bound, to execute
      // 調用DOM ready事件異步隊列readyList，注意整理的參數亮了！
      // document指定了ready句柄的上下文，這樣我們在執行ready事件句柄時this指向document
      // [ jQuery ]指定了ready事件句柄的第一個參數，這樣即使調用$.noConflict()交出了$的控制權，我們依然可以將句柄的第一個參數命名為$，繼續在句柄內部使用$符號
      // 如此的精緻！讚歎之餘，但不要在你的項目中也這麼用，理解和維護將成為最大的難題。

      readyList.resolveWith(document, [jQuery]);

      // Trigger any bound ready events
      if (jQuery.fn.trigger) {
        // 觸發 ready 事件，然後刪除ready句柄，DOM ready事件只會生效一次
        // ready 是個自定義事件

        jQuery(document).trigger("ready").unbind("ready");

      }
    }
  },
  // 綁定DOM ready監聽器，跨瀏覽器，兼容標準瀏覽器和IE瀏覽器

  bindReady: function () { // jQuery.bindReady

    if (readyList) {
      return;
    }
    readyList = jQuery._Deferred(); // 初始化ready異步事件句柄隊列

    // Catch cases where $(document).ready() is called after thebrowser event has already occurred.
    // 如果DOM已經完畢，立即調用jQuery.ready

    if (document.readyState === "complete") {

      // Handle it asynchronously to allow scripts the opportunity to delay ready
      // 重要的是異步
      return setTimeout(jQuery.ready, 1);
    }
    //----------------------------

    // Mozilla, Opera and webkit nightlies currently support this event
    // DOM 2級事件模型，Mozilla, Opera, webkit等
    // Use the handy event callback

    // 使用快速事件句柄
    document.addEventListener("DOMContentLoaded", function DOMContentLoaded() {

      // document ready之後移除    
      document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);

      jQuery.ready();
    }, false);

    // A fallback to window.onload, that will always work
    // 再在window上綁定load事件句柄，這個句柄總是會執行
    // 為什麼同時綁定document window呢？我想是為了安全起見，防禦性編碼！

    window.addEventListener("load", jQuery.ready, false);
  },
};




