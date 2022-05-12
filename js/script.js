
host = "broker.mqttdashboard.com"; // hostname or IP address
port = 8000;
topic = "device/test"; // topic to subscribe to
useTLS = false;
username = null;
password = null;
path = "/mqtt";


cleansession = true;

var mqtt;
var reconnectTimeout = 2000;

var chartP = new Highcharts.Chart({
  chart: { renderTo: "chart-power" },
  title: { text: "Power" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: {
      animation: false,
      dataLabels: { enabled: true },
    },
    series: { color: "#059e8a" },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "Power (kW)" },
    //title: { text: 'Temperature (Fahrenheit)' }
  },
  credits: { enabled: false },
});

var chartC = new Highcharts.Chart({
  chart: { renderTo: "chart-current" },
  title: { text: "Current" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: {
      animation: false,
      dataLabels: { enabled: true },
    },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "Current (mA)" },
  },
  credits: { enabled: false },
});

var chartV = new Highcharts.Chart({
  chart: { renderTo: "chart-voltage" },
  title: { text: "Voltage" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: {
      animation: false,
      dataLabels: { enabled: true },
    },
    series: { color: "#18009c" },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "Voltage (V)" },
  },
  credits: { enabled: false },
});



function MQTTconnect() {
  if (typeof path == "undefined") {
    path = "/mqtt";
  }
  mqtt = new Paho.MQTT.Client(
    host,
    port,
    path,
    "web_" + parseInt(Math.random() * 100, 10)
  );
  var options = {
    timeout: 3,
    useSSL: useTLS,
    cleanSession: cleansession,
    onSuccess: onConnect,
    onFailure: function (message) {
      $("#status").val(
        "Connection failed: " + message.errorMessage + "Retrying"
      );
      setTimeout(MQTTconnect, reconnectTimeout);
    },
  };

  mqtt.onConnectionLost = onConnectionLost;
  mqtt.onMessageArrived = onMessageArrived;

  if (username != null) {
    options.userName = username;
    options.password = password;
  }
  console.log(
    "Host=" +
      host +
      ", port=" +
      port +
      ", path=" +
      path +
      " TLS = " +
      useTLS +
      " username=" +
      username +
      " password=" +
      password
  );
  mqtt.connect(options);
}

function onConnect() {
  $("#mqtt-status").text("Connected to " + host + ":" + port + path +"  ,topic: "+ topic);
  // Connection succeeded; subscribe to our topic
  mqtt.subscribe(topic, { qos: 0 });
  $("#topic").val(topic);
}

function onConnectionLost(response) {
  setTimeout(MQTTconnect, reconnectTimeout);
  $("#status").val(
    "connection lost: " + responseObject.errorMessage + ". Reconnecting"
  );
}

function onMessageArrived(message) {
  var topic = message.destinationName;
  var payload = message.payloadString;

  if (payload != undefined && payload.length > 0) {
    const json_payload = JSON.parse(payload);
    console.log(json_payload);
    var x = new Date().getTime();
    //console.log(this.responseText);
    (chartP.series[0].data.length > 40) ? chartP.series[0].addPoint([x, parseFloat(json_payload.power)], true, true, true) : chartP.series[0].addPoint([x, parseFloat(json_payload.power)], true, false, true);
    (chartC.series[0].data.length > 40) ? chartC.series[0].addPoint([x, parseFloat(json_payload.current)], true, true, true) : chartC.series[0].addPoint([x, parseFloat(json_payload.current)], true, false, true);
    (chartV.series[0].data.length > 40) ? chartV.series[0].addPoint([x, parseFloat(json_payload.voltage)], true, true, true) : chartV.series[0].addPoint([x, parseFloat(json_payload.voltage)], true, false, true);
    
  }
}

$(document).ready(function () {
  MQTTconnect();
});
