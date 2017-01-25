function gmailCleanUp() {
  
  searchToArchive( "category:forums older_than:2d in:inbox" );
  searchToArchive( "category:social older_than:2d in:inbox" );
  searchToArchive( "label:wotrm@mx5.canvas.ne.jp older_than:30d in:inbox" );
  searchToArchive( "label:ml-tutaya older_than:7d in:inbox" );
  searchToArchive( "category:promotions older_than:1d in:inbox" );
}

/**
 * エントリーポイント
 *
 * 指定した条件に一致するメールをslackへ投稿
 * 投稿後は、既読扱い
 *
 */
function gmailToSlack() {
  crowlGmailToSlack("label:auto_exec-slack-watch is:unread", "_watch");
  crowlGmailToSlack("label:auto_exec-slack-tech is:unread", "_tech");
  crowlGmailToSlack("label:auto_exec-slack-sale is:unread", "_sale", true );
}


function slackTest() {
  var prop = PropertiesService.getScriptProperties();
  
  //slackApp インスタンスの取得
  var slackApp = SlackApp.create(prop.getProperty("slack_token"));
  var object = [];
  var object = [{
    "pretext": "pre-hello",
    "text": "text-world"
  }];
  
  slackApp.postMessage( "random", "hello", {
    "username": "slackTest",
    "attachments": JSON.stringify(object)
  } );
}
/**
 * 指定した条件に一致するメールを既読＋アーカイブ
 *
 */
function searchToArchive( searchWord ) {
  var threads ;
  var beforeCount = 0 ;
  var afterCount = 0 ;
  
  threads = GmailApp.search( searchWord );
  beforeCount = threads.length ;
  GmailApp.markThreadsRead( threads );
  GmailApp.moveThreadsToArchive( threads );
  afterCount = GmailApp.search( searchWord ).length ;
  
  Logger.log( "Archive SearchWord[%s]  count:%s -> %s", searchWord, beforeCount, afterCount ) ;
}


/**
 * 指定した条件に一致するメールをslackへ投稿
 * 投稿後は、既読扱い
 *
 */
function crowlGmailToSlack( searchWord, channelName, isHeadlineMode ) {
  var threads ;
  var beforeCount = 0 ;
  var afterCount = 0 ;
  
  Logger.log( "start crowlGmailToSlack word[%s]", searchWord )
  threads = GmailApp.search( searchWord );
  beforeCount = threads.length ;
  
  for(var i = 0; i < threads.length; i++) {  
    var thread = threads[i].getMessages()[0];
    slackPostGmail( channelName, thread, isHeadlineMode );
  }

  GmailApp.markThreadsRead( threads );
  GmailApp.moveThreadsToArchive( threads );
  afterCount = GmailApp.search( searchWord ).length ;
  
  Logger.log( "Archive SearchWord[%s]  count:%s -> %s", searchWord, beforeCount, afterCount ) ;
}


// -----------------------------------------------
// ここから下、private
/**
 * 指定したチャンネルへGMAILの内容を送信
 * 
 */
function slackPostGmail( channelName, mail, isHeadlineMode ) {
  if( isHeadlineMode == null ) {
    isHeadlineMode = false ;
  }
  
  if( !mail ) {
    // メールのパースに失敗しそうなので処理を中断
    Logger.log( "bypass[%s]", mail );
    return ;
  }
  
  Logger.log( "mail[%s]", mail ) ;
  // gmail から情報取得
  var from = mail.getFrom();
  var subject = mail.getSubject();
  var body = mail.getPlainBody().replace(/&<("[^"]*"|'[^']*'|[^'">])*>|nbsp/g,'').replace(/&; |　/g,'');
  var object = [];
  
  var message = subject;
  if( isHeadlineMode != true ) {
    object = [{
      "text": body
    }];
  }
  Logger.log( "gmail  from[%s]  message[%s]", from, message ) ;
  
  slackPostMessage( channelName, message, {
    username: from,
    attachments: JSON.stringify(object)
  } );
}

/**
 * 指定したチャンネルへメッセージ送信
 * 
 */
function slackPostMessage( channelName, message, object ) {
  var prop = PropertiesService.getScriptProperties();

  //slackApp インスタンスの取得
  var slackApp = SlackApp.create(prop.getProperty("slack_token"));
  
　//投稿
  slackApp.postMessage(channelName, message, object);
//  slackApp.postMessage(channelId, subject, {
//    username : from,
//    "attachments": [{"text": message}]
//  });

}

