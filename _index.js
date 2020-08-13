let application = require('./_app.js');

app();

async function app(){
    
    let token = await application.getToken('mehdi', '1' ,{
        
        role: 'access_token',
        scope: '/things/http---ubuntu.local-8888:readwrite'
    });    //done
    /*role: 'access_token',
        scope: '/things/http---ubuntu.local-8888:readwrite'*/
    console.log(token);
    /*let sensors = await application.getSensors();
    console.log(sensors);*/
    //let up = application.update(["812c44fe-6938-45cb-b714-b63c4b36b1e0"], []); // à desactiver, à activer
    //let up = await application.updateEnableToDisable(["3a1dedf1-0f3e-4327-beb8-f0662dcbfd38"]);
    //let up_ = application.updateDisableToEnable(["06193b93-cd16-4027-9930-e8780ccb986b", "8ddbc367-35a9-47ca-aed4-c13b9295180b", "bd8e626c-5e51-49c6-97dd-6d6c550b7697", "4ffcaaa8-0d5f-427b-b11b-75be23a6974d", "d0cd6dd1-8a31-4c57-8d35-961d84f5e7c8", "3a358025-d1b1-490c-af4a-62cfd6440eb2"]);
    //let apps = await application.getEnabledApps();
    //console.log(apps);
    //let apps_ = await application.getDisabledApps();
    //console.log(apps_);
    //let clear = await application.clearDatabase();
}

