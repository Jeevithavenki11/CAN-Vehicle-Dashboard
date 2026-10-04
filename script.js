/* =================================
   GLOBAL VARIABLES
================================= */

let messageCount = 0;

let messageStartTime = Date.now();

let rpmData = [];

let temperatureData = [];

let voltageData = [];


/* Fault counters */

let criticalCount = 0;

let warningCount = 0;

let normalCount = 0;


/* =================================
   GENERATE CAN FRAME
================================= */

function generateCANFrame() {

    let rpm =
        Math.floor(
            Math.random() * 2000 + 1500
        );


    let temperature =
        Math.floor(
            Math.random() * 35 + 70
        );


    let voltage =
        Math.floor(
            Math.random() * 15 + 115
        );


    let speed =
        Math.floor(
            Math.random() * 121
        );


    let engineLoad =
        Math.floor(
            Math.random() * 81 + 10
        );


    let fuelLevel =
        Math.floor(
            Math.random() * 91 + 10
        );


    /* RPM hexadecimal */

    let rpmHex =
        rpm.toString(16)
            .padStart(4, "0")
            .toUpperCase();


    let temperatureHex =
        temperature.toString(16)
            .padStart(2, "0")
            .toUpperCase();


    let voltageHex =
        voltage.toString(16)
            .padStart(2, "0")
            .toUpperCase();


    let byte1 =
        rpmHex.substring(0, 2);


    let byte2 =
        rpmHex.substring(2, 4);


    let data =
        byte1 + " " +
        byte2 + " " +
        temperatureHex + " " +
        voltageHex;


    return {

        id: "0x101",

        data: data,

        speed: speed,

        engineLoad: engineLoad,

        fuelLevel: fuelLevel

    };

}


/* =================================
   DECODE CAN FRAME
================================= */

function decodeCANFrame(canFrame) {

    let bytes =
        canFrame.data.split(" ");


    let rpm =
        parseInt(
            bytes[0] + bytes[1],
            16
        );


    let temperature =
        parseInt(
            bytes[2],
            16
        );


    let voltageRaw =
        parseInt(
            bytes[3],
            16
        );


    let voltage =
        voltageRaw / 10;


    return {

        rpm: rpm,

        temperature: temperature,

        voltage: voltage,

        speed: canFrame.speed,

        engineLoad: canFrame.engineLoad,

        fuelLevel: canFrame.fuelLevel

    };

}


/* =================================
   UPDATE FAULT SUMMARY
================================= */

function updateFaultSummary() {

    document.getElementById(
        "criticalCount"
    ).innerText =
        criticalCount;


    document.getElementById(
        "warningCount"
    ).innerText =
        warningCount;


    document.getElementById(
        "normalCount"
    ).innerText =
        normalCount;

}


/* =================================
   UPDATE DASHBOARD
================================= */

function updateVehicleData() {

    let canFrame =
        generateCANFrame();


    messageCount++;


    /* Message rate */

    let elapsedTime =
        (Date.now() - messageStartTime) / 1000;


    let messageRate =
        messageCount / elapsedTime;


    document.getElementById(
        "messageCount"
    ).innerText =
        messageCount;


    document.getElementById(
        "lastCanId"
    ).innerText =
        canFrame.id;


    document.getElementById(
        "messageRate"
    ).innerText =
        messageRate.toFixed(2)
        + " msg/s";


    document.getElementById(
        "busStatus"
    ).innerText =
        "🟢 Active";


    /* Decode */

    let vehicleData =
        decodeCANFrame(canFrame);


    let rpm =
        vehicleData.rpm;


    let temperature =
        vehicleData.temperature;


    let voltage =
        vehicleData.voltage;


    let speed =
        vehicleData.speed;


    let engineLoad =
        vehicleData.engineLoad;


    let fuelLevel =
        vehicleData.fuelLevel;


    /* =================================
       DISPLAY PARAMETERS
    ================================= */

    document.getElementById(
        "rpm"
    ).innerText =
        rpm;


    document.getElementById(
        "temperature"
    ).innerText =
        temperature;


    document.getElementById(
        "voltage"
    ).innerText =
        voltage.toFixed(1);


    document.getElementById(
        "speed"
    ).innerText =
        speed;


    document.getElementById(
        "engineLoad"
    ).innerText =
        engineLoad;


    document.getElementById(
        "fuelLevel"
    ).innerText =
        fuelLevel;


    /* =================================
       CAN MONITOR
    ================================= */

    document.getElementById(
        "canId"
    ).innerText =
        canFrame.id;


    document.getElementById(
        "canData"
    ).innerText =
        canFrame.data;


    document.getElementById(
        "canMessage"
    ).innerText =
        "Vehicle Parameter Data";


    /* =================================
       CAN LOG
    ================================= */

    let currentTime =
        new Date().toLocaleTimeString();


    let canLog =
        document.getElementById(
            "canLog"
        );


    let row =
        canLog.insertRow(0);


    row.insertCell(0).innerText =
        currentTime;


    row.insertCell(1).innerText =
        canFrame.id;


    row.insertCell(2).innerText =
        canFrame.data;


    row.insertCell(3).innerText =
        rpm;


    row.insertCell(4).innerText =
        temperature + " °C";


    row.insertCell(5).innerText =
        voltage.toFixed(1) + " V";


    if (canLog.rows.length > 10) {

        canLog.deleteRow(10);

    }


    /* =================================
       FAULT DETECTION
    ================================= */

    let faultStatus =
        document.getElementById(
            "faultStatus"
        );


    let faultName = "";

    let faultValue = "";

    let faultCode = "";

    let currentFaultLevel =
        "normal";


    /* NORMAL */

    faultStatus.innerText =
        "🟢 VEHICLE STATUS: NORMAL";


    faultStatus.style.color =
        "#22c55e";


    faultStatus.style.backgroundColor =
        "#052e16";


    faultStatus.style.borderColor =
        "#22c55e";


    /* =================================
       TEMPERATURE
    ================================= */

    if (temperature > 95) {

        faultCode =
            "P0217";

        faultName =
            "High Temperature";

        faultValue =
            temperature + " °C";


        faultStatus.innerText =
            "🔴 VEHICLE STATUS: CRITICAL TEMPERATURE";


        faultStatus.style.color =
            "#ef4444";


        faultStatus.style.backgroundColor =
            "#450a0a";


        faultStatus.style.borderColor =
            "#ef4444";


        currentFaultLevel =
            "critical";

    }


    else if (temperature > 90) {

        faultStatus.innerText =
            "🟡 VEHICLE STATUS: TEMPERATURE WARNING";


        faultStatus.style.color =
            "#facc15";


        faultStatus.style.backgroundColor =
            "#422006";


        faultStatus.style.borderColor =
            "#facc15";


        currentFaultLevel =
            "warning";

    }


    /* =================================
       VOLTAGE
    ================================= */

    else if (voltage < 12.0) {

        faultCode =
            "P0562";

        faultName =
            "Low Battery Voltage";

        faultValue =
            voltage.toFixed(1) + " V";


        faultStatus.innerText =
            "🔴 VEHICLE STATUS: LOW BATTERY VOLTAGE";


        faultStatus.style.color =
            "#ef4444";


        faultStatus.style.backgroundColor =
            "#450a0a";


        faultStatus.style.borderColor =
            "#ef4444";


        currentFaultLevel =
            "critical";

    }


    else if (voltage < 12.2) {

        faultStatus.innerText =
            "🟡 VEHICLE STATUS: LOW VOLTAGE WARNING";


        faultStatus.style.color =
            "#facc15";


        faultStatus.style.backgroundColor =
            "#422006";


        faultStatus.style.borderColor =
            "#facc15";


        currentFaultLevel =
            "warning";

    }


    /* =================================
       RPM
    ================================= */

    else if (rpm > 3200) {

        faultCode =
            "P0211";

        faultName =
            "High RPM";

        faultValue =
            rpm + " RPM";


        faultStatus.innerText =
            "🔴 VEHICLE STATUS: HIGH RPM";


        faultStatus.style.color =
            "#ef4444";


        faultStatus.style.backgroundColor =
            "#450a0a";


        faultStatus.style.borderColor =
            "#ef4444";


        currentFaultLevel =
            "critical";

    }


    else if (rpm > 3000) {

        faultStatus.innerText =
            "🟡 VEHICLE STATUS: HIGH RPM WARNING";


        faultStatus.style.color =
            "#facc15";


        faultStatus.style.backgroundColor =
            "#422006";


        faultStatus.style.borderColor =
            "#facc15";


        currentFaultLevel =
            "warning";

    }


    /* =================================
       UPDATE COUNTERS
    ================================= */

    if (currentFaultLevel === "critical") {

        criticalCount++;

    }

    else if (currentFaultLevel === "warning") {

        warningCount++;

    }

    else {

        normalCount++;

    }


    updateFaultSummary();


    /* =================================
       FAULT HISTORY
    ================================= */

    if (faultName !== "") {

        let faultLog =
            document.getElementById(
                "faultLog"
            );


        let faultTime =
            new Date().toLocaleTimeString();


        let faultRow =
            faultLog.insertRow(0);


        faultRow.insertCell(0).innerText =
            faultTime;


        faultRow.insertCell(1).innerText =
            faultCode +
            " - " +
            faultName;


        faultRow.insertCell(2).innerText =
            faultValue;


        faultRow.insertCell(3).innerText =
            "🔴 Fault";


        if (faultLog.rows.length > 10) {

            faultLog.deleteRow(10);

        }

    }


    /* =================================
       STORE GRAPH DATA
    ================================= */

    rpmData.push(rpm);

    temperatureData.push(temperature);

    voltageData.push(voltage);


    if (rpmData.length > 30) {

        rpmData.shift();

        temperatureData.shift();

        voltageData.shift();

    }


    /* =================================
       DRAW GRAPHS
    ================================= */

    drawGraph(
        "rpmGraph",
        rpmData,
        1500,
        3500
    );


    drawGraph(
        "temperatureGraph",
        temperatureData,
        70,
        105
    );


    drawGraph(
        "voltageGraph",
        voltageData,
        11.5,
        13.0
    );

}


/* =================================
   DRAW GRAPH
================================= */

function drawGraph(
    canvasId,
    data,
    minValue,
    maxValue
) {

    let canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        return;

    }


    let ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Background */

    ctx.fillStyle =
        "#0f172a";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* Grid */

    ctx.beginPath();

    ctx.strokeStyle =
        "#334155";

    ctx.lineWidth = 1;


    for (
        let y = 0;
        y <= canvas.height - 25;
        y += 50
    ) {

        ctx.moveTo(
            45,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

    }


    for (
        let x = 45;
        x <= canvas.width;
        x += 100
    ) {

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height - 25
        );

    }


    ctx.stroke();


    /* Y axis */

    ctx.fillStyle =
        "#94a3b8";

    ctx.font =
        "12px Arial";


    let steps = 5;


    for (
        let i = 0;
        i <= steps;
        i++
    ) {

        let value =
            maxValue -
            (
                (maxValue - minValue)
                / steps
            ) * i;


        let y =
            (
                (canvas.height - 25)
                / steps
            ) * i;


        ctx.fillText(
            value.toFixed(1),
            5,
            y + 15
        );

    }


    /* Time axis */

    ctx.fillStyle =
        "#94a3b8";


    for (
        let i = 0;
        i <= 25;
        i += 5
    ) {

        let x =
            45 +
            (
                i / 29
            ) *
            (canvas.width - 45);


        ctx.fillText(
            "-" + i + "s",
            x - 10,
            canvas.height - 5
        );

    }


    ctx.fillStyle =
        "#38bdf8";


    ctx.fillText(
        "Time",
        canvas.width - 40,
        canvas.height - 5
    );


    /* Graph line */

    if (data.length < 2) {

        return;

    }


    ctx.beginPath();

    ctx.strokeStyle =
        "#00e5ff";

    ctx.lineWidth = 3;


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        let x =
            45 +
            (
                i / 29
            ) *
            (canvas.width - 45);


        let y =
            (
                canvas.height - 25
            ) -
            (
                (data[i] - minValue) /
                (maxValue - minValue)
            ) *
            (canvas.height - 25);


        if (y < 0) {

            y = 0;

        }


        if (
            y >
            canvas.height - 25
        ) {

            y =
                canvas.height - 25;

        }


        if (i === 0) {

            ctx.moveTo(
                x,
                y
            );

        }

        else {

            ctx.lineTo(
                x,
                y
            );

        }

    }


    ctx.stroke();

}


/* =================================
   CLEAR FAULT HISTORY
================================= */

document.getElementById(
    "clearFaults"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "faultLog"
        ).innerHTML = "";

    }
);


/* =================================
   EXPORT CAN DATA
================================= */

document.getElementById(
    "exportCAN"
).addEventListener(
    "click",
    function () {

        let table =
            document.querySelector(
                ".can-log-section table"
            );


        let rows =
            table.querySelectorAll(
                "tr"
            );


        let csv = [];


        rows.forEach(
            function (row) {

                let cells =
                    row.querySelectorAll(
                        "th, td"
                    );


                let rowData = [];


                cells.forEach(
                    function (cell) {

                        rowData.push(
                            '"' +
                            cell.innerText +
                            '"'
                        );

                    }
                );


                csv.push(
                    rowData.join(",")
                );

            }
        );


        let csvFile =
            new Blob(
                [csv.join("\n")],
                {
                    type: "text/csv"
                }
            );


        let downloadLink =
            document.createElement("a");


        downloadLink.href =
            URL.createObjectURL(
                csvFile
            );


        downloadLink.download =
            "CAN_Diagnostic_Data.csv";


        downloadLink.click();


        URL.revokeObjectURL(
            downloadLink.href
        );

    }
);


/* =================================
   START DASHBOARD
================================= */

updateVehicleData();


/* Update every 2 seconds */

setInterval(
    updateVehicleData,
    2000
);