#property version   "1.00"
#property strict

#include <lib_websockets.mqh>

input string   Host = "ws://localhost:8080/ws";
input int      HeatBeatPeriod = 45;
input string   assets = "EURUSD,USDJPY,GBPUSD"; // aggiungi gli asset come una stringa separata da virgole
input string   inputLabel = "MyLabel"; // input per la label
input int      sendFrequency = 1; // frequenza di invio dei dati in secondi

WebSocketsProcessor *ws;

string assetList[];

int OnInit() {

  ws = new WebSocketsProcessor(Host, 30, 45);    
  
  ws.SetHeader( "account", AccountNumber() );
  ws.Init();
  
  // Dividi la stringa di asset in un array
  int numAssets = StringSplit(assets, ',', assetList);

  // Imposta il timer secondo la frequenza specificata
  EventSetTimer(sendFrequency);
  
  return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason) {
  EventKillTimer();
  delete ws;
}

void OnTick() {

}

void OnTimer() {
  // Effettua le chiamate HTTP ogni volta che il timer scatta
  for (int i=0; i<ArraySize(assetList); i++) {
    make_request(assetList[i], inputLabel);
  }

  string cmd = ws.GetCommand();

  if(cmd != "") {
    Print("cmd: " + cmd);
  }
  
}

void make_request(string symbol, string label) {
   double bid = NormalizeDouble(SymbolInfoDouble(symbol, SYMBOL_BID), _Digits);
   double ask = NormalizeDouble(SymbolInfoDouble(symbol, SYMBOL_ASK), _Digits);
   double spread = bid - ask;
   string request = StringFormat("{\"symbol\":\"%s\", \"bid\":%.5f, \"ask\":%.5f, \"spread\":%.5f, \"broker\":\"%s\"}", symbol, bid, ask,spread, label);
   
   ws.Send(request);
}
