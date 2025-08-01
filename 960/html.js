var runonce = "false"; // changes to "true" once the exploit has been run
var payloadFile = '../payloads/goldhen/pl_GoldHENv2.4b18.3.bin'; // default payload
var payloadTitle = 'GoldHEN v2.4b18.3';
var message = 'Lapse exploiting console and injecting ';

function showMessage(msg) {
    // Only update message text — not the whole #message container
    const statusText = document.getElementById("statusText");
    if (statusText) {
        statusText.innerHTML = "<h1>" + msg + "</h1>";
    }
    document.getElementById("message").style.display = 'block';
}

function cachepage() {
    if (window.applicationCache.status == '0') {
        window.location.replace("./cache.html");
    }
    else {
    	showMessage("Cache is already installed");
    }
}

function callalert() {
    showMessage("Please wait, Attempting to inject: " + payloadTitle);
    import('./alert.mjs');
}

function goldhen() {
    payloadFile = '../payloads/goldhen/pl_GoldHENv2.4b18.3.bin';
    payloadTitle = 'GoldHEN v2.4b18.3';
    callalert();
}

function vtx2() {
    payloadFile = '../payloads/mirahen/960/ps4hen_lite_9.60.bin';
    payloadTitle = 'Hen Beta 2.2.0';
    callalert();
}

function vtx() {
    payloadFile = '../payloads/linux/960/ps4-linux-pro-2gb.bin';
    payloadTitle = 'Linux PS4 PRO 2GB';
    callalert();
}

function linux1() {
    payloadFile = '../payloads/linux/960/pl_Linux256MB_Phat.bin';
    payloadTitle = 'Linux PS4 257mb';
    callalert();
}

function linux2() {
    payloadFile = '../payloads/linux/960/pl_Linux512MB_Phat.bin';
    payloadTitle = 'Linux PS4 512mb';
    callalert();
}

function linux3() {
    payloadFile = '../payloads/linux/960/pl_Linux1GB_Phat.bin';
    payloadTitle = 'Linux PS4 1GB';
    callalert();
}

function linux4() {
    payloadFile = '../payloads/linux/960/pl_Linux2GB_Phat.bin';
    payloadTitle = 'Linux PS4 2GB';
    callalert();
}

function linux5() {
    payloadFile = '../payloads/linux/960/pl_Linux3GB_Phat.bin';
    payloadTitle = 'Linux PS4 3GBs';
    callalert();
}

function linux6() {
    payloadFile = '../payloads/linux/960/pl_Linux4GB_Phat.bin';
    payloadTitle = 'Linux PS4 4GB';
    callalert();
}

function linux7() {
    payloadFile = '../payloads/linux/960/pl_Linux256MB_Pro.bin';
    payloadTitle = 'Linux PS4 PRO 256mb';
    callalert();
}

function linux8() {
    payloadFile = '../payloads/linux/960/pl_Linux512MB_Pro.bin';
    payloadTitle = 'Linux PS4 PRO 512mb';
    callalert();
}

function linux9() {
    payloadFile = '../payloads/linux/960/pl_Linux1GB_Pro.bin';
    payloadTitle = 'Linux PS4 PRO 1GB';
    callalert();
}

function linux10() {
    payloadFile = '../payloads/linux/960/pl_Linux2GB_Pro.bin';
    payloadTitle = 'Linux PS4 PRO 2GB';
    callalert();
}

function linux11() {
    payloadFile = '../payloads/linux/960/pl_Linux3GB_Pro.bin';
    payloadTitle = 'Linux PS4 PRO 3GBs';
    callalert();
}

function linux12() {
    payloadFile = '../payloads/linux/960/pl_Linux4GB_Pro.bin';
    payloadTitle = 'Linux PS4 PRO 4GB';
    callalert();
}

function linux13() {
    payloadFile = '../payloads/linux/960/pl_Linux2560MB_Phat.bin';
    payloadTitle = 'Linux PS4 2560MB';
    callalert();
}

function linux14() {
    payloadFile = '../payloads/linux/960/pl_Linux2560MB_Pro.bin';
    payloadTitle = 'Linux PS4 PRO 2560MB';
    callalert();
}

function historyblocker() {
    payloadFile = '../payloads/payloads/pl_Historyblocker.bin';
    payloadTitle = 'History Blocker';
    callalert();
}

function disabledupdates() {
    payloadFile = '../payloads/payloads/pl_Disable_Updates.bin';
    payloadTitle = 'Disable Updates';
    callalert();
}

function enableupdates() {
    payloadFile = '../payloads/payloads/pl_Enable_Browser.bin';
    payloadTitle = 'Enable Updates';
    callalert();
}

function bloader() {
    payloadTitle = 'Binloader';
    callalert();
}

function dumpG() {
    payloadFile = './payloads/dumpers/dumperG.bin';
    payloadTitle = 'Game Dumper';
    callalert();
}

function dumpU() {
    payloadFile = './payloads/dumpers/dumperU.bin';
    payloadTitle = 'Game Update Dumper';
    callalert();
}

function dumpGU() {
    payloadFile = './payloads/dumpers/dumperGU.bin';
    payloadTitle = 'Game and Update Dumper';
    callalert();
}

function dumpM() {
    payloadFile = './payloads/dumpers/dumperM.bin';
    payloadTitle = 'Dump and Merge Game + Update';
    callalert();
}

function dbbackup() {
    payloadFile = '../payloads/payloads/pl_Datenbank_Backup.bin';
    payloadTitle = 'Database backup';
    callalert();
}

function dbrestore() {
    payloadFile = '../payloads/payloads/pl_Datenbank_Restore.bin';
    payloadTitle = 'Database restore';
    callalert();
}

//function not called for now, keep incase I want to use in the future...
function reset() {
    const checkbox = document.getElementById('myCheckbox');
    if (checkbox) {
        checkbox.checked = false;
        localStorage.setItem('checkboxState', 'false');
    }
}

//checkbox sections
document.addEventListener('DOMContentLoaded', () => {
    const checkbox = document.getElementById('myCheckbox');
    const checkbox2 = document.getElementById('myCheckbox2');

    // Load saved checkbox state from localStorage
    const savedState = localStorage.getItem('checkboxState');
    const savedState2 = localStorage.getItem('checkboxState2');

    if (savedState !== null && checkbox) {
        checkbox.checked = savedState === 'true';
        onCheckboxChange(checkbox.checked);
    }

    if (savedState2 !== null && checkbox2) {
        checkbox2.checked = savedState2 === 'true';
        onCheckboxChange2(checkbox2.checked);
    }

    if (savedState3 !== null && checkbox3) {
        checkbox3.checked = savedState3 === 'true';
        onCheckboxChange3(checkbox3.checked);
    }

    // Save checkbox state and optionally trigger action
    if (checkbox) {
        checkbox.addEventListener('change', function () {
            localStorage.setItem('checkboxState', checkbox.checked);
            onCheckboxChange(checkbox.checked);
        });
    }

    if (checkbox2) {
        checkbox2.addEventListener('change', function () {
            localStorage.setItem('checkboxState2', checkbox2.checked);
            onCheckboxChange2(checkbox2.checked);
        });
    }

    if (checkbox3) {
        checkbox3.addEventListener('change', function () {
            localStorage.setItem('checkboxState3', checkbox3.checked);
            onCheckboxChange3(checkbox3.checked);
        });
    }

    function onCheckboxChange(isChecked) {
        if (isChecked) {
            goldhen();
        }
    }

    function onCheckboxChange2(isChecked) {
        if (isChecked) {
            vtx();
        }
    }

    function onCheckboxChange3(isChecked) {
        if (isChecked) {
            vtx();
        }
    }
});
