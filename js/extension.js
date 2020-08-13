(function () {
  
  class TokenManager extends window.Extension {
    constructor() {
      super('token-manager');
      this.addMenuEntry('Token Manager');

      if (!window.Extension.prototype.hasOwnProperty('load')) {
        this.load();

      }
    }

    load() {
      this.content = '';
      return fetch(`/extensions/${this.id}/views/content.html`)
        .then((res) => res.text())
        .then((text) => {
          this.content = text;

        })
        .catch((e) => console.error('Failed to fetch content:', e))
        ;
    }

    show() {
      this.view.innerHTML = this.content;
    

      const Appname =
        document.getElementById('manager-token-extension-form-key');
      const token =
        document.getElementById('manager-token-extension-form-token');
      const generate =
        document.getElementById('manager-token-extension-form-submit');
      const pre =
        document.getElementById('manager-token-extension-response-data');
      const Savedeactive =
        document.getElementById('manager-token-extension-form-deactive');
      const Saveactive =
        document.getElementById('manager-token-extension-form-active');
      const sensors =
      document.getElementById('manager-token-extension-response-sensors');
      const active =
      document.getElementById('manager-token-extension-response-active');

      //document.write('<script src="https://code.jquery.com/jquery-3.5.0.js" type="text/javascript" />');

      var CheckedSensors = [];
      var Check = [];
      var ch = "";
      var sensf = '';
      var CheckeDeactiveApps = [];
      var Check2 = [];
      
      var CheckedActiveApps = [];
      var Check1 = [];

      window.API.postJson(
        `/extensions/${this.id}/api/getSensors`
      ).then((body) => {
        var item = body;

        /*async function test(){
          const response = await fetch('https://unpkg.com/vue');
          const script = await response.text();
          let vue = eval(script);

          var appstest = new Vue({
            el: '#apptest',
            data () {
              return { message : 'hello' }
            }
          })

        }
        
        test();*/

// <script src="https://code.jquery.com/jquery-3.5.0.js"></script>
/*const loadScript = async (url) => {
  const response = await fetch(url)
  const script = await response.text();
  let Vue = eval(script);
 alert(Vue)
  console.log("1");
window.onload = await myfunction();

 async function myfunction(){
   //import Vue from response;

    alert("Vue");
    var appstest = new Vue({
      el: '#apptest',
      data () {
        return { message : 'hello' }
      }
    })
  }

  
 $(document).ready(function(){
    $("button").click(function(){
      var number_of_rows = $('#rows').val();
      var number_of_cols = $('#cols').val();
      var table_body = '<table border="1">';
      for(var i=0;i<number_of_rows;i++){
        table_body+='<tr>';
        for(var j=0;j<number_of_cols;j++){
            table_body +='<td>';
            table_body +='Table data';
            table_body +='</td>';
        }
        table_body+='</tr>';
      }
        table_body+='</table>';
       $('#tableDiv').html(table_body);
    });
});

}*/
 
//const scriptUrl = "https://unpkg.com/vue";//"https://code.jquery.com/jquery-3.5.0.js"
//loadScript(scriptUrl);  

// Use jQuery:
//$("div").css("border", "3px dotted orange");

//if (typeof jQuery != 'undefined') {  
  // jQuery is loaded => print the version
  //alert("hello" );
  
//}


        for (var j = 0; j < item.length; j++) {
          const sens = `<input type="checkbox" id="check${j}"value="${j}"> 
          <label for="${item[j]}">${item[j]}</label>
          <br>`
          sensf = sensf + sens;
        }

        sensors.innerHTML = sensf;

        
        function checksensors() {

          for (var j = 0; j < item.length; j++) {
            CheckedSensors[j] = document.getElementById("check" + j)
          }

          for (var j = 0; j < item.length; j++) {
            if (CheckedSensors[j].checked) {
              Check[j] = item[j]
            }
            else {
              Check[j] = null
            }
          }
          Check = Check.filter(function (el) {
            return el != null
          })
          Check[0] = "/things/" + Check[0] + ":readwrite"
          for (var j = 1; j < Check.length; j++) {
            Check[j] = " /things/" + Check[j] + ":readwrite"
          }

          for (var j = 0; j < Check.length; j++) {
            ch += Check[j];
            //console.log(ch);
          }
        }

        generate.addEventListener('click', () => {
          checksensors()
          
          if (Appname.value != 0 && Check.length != 0 && Appname.value != null && Check.length != null && Appname.value != undefined && Check.length != undefined) {
            console.log(Appname.value);
            console.log(Check);
            
            window.API.postJson(
              `/extensions/${this.id}/api/getToken`,
              {
                'name': Appname.value,
                'user': '1',
                'scope': ch
              }
            ).then((body) => {
              token.value = JSON.stringify(body);
            }).catch((e) => {
              token.value = e.toString();
            });

            //token.value = "rZW4iLCJzY29wZSI6Ii90aGluZ3MvaHR0cC0tLW5vZXVkXzIubG9jYWwtdGhpbmdzLURIVDExOnJlYWR3cml0ZSAvdGhpbmdzL2h0dHAtLS13MjUubG9jYWwtdGhpbmdzLWxlZDpyZWFkd3JpdGUgL3RoaW5ncy9odHRwLS0tdzI2LmxvY2FsLXRoaW5ncy1sZWQ6cmVhZHdyaXRlIiwiaWF0IjoxNTk3MDU0ODQ4LCJpc3MiOiJodHRwczovL3NsYWNrZXJzdGVzdDAxMS5zbGFja2Vycy5pbyJ9.vuLkXb8YRVjJoIwdD5J195aXVUfjZoYBltdJdTjSG6uZ2zkqAGGqLeStHqXUSBCBYtYlTXL7w6lCq4OREMTjzw"
          }
          else if (Appname.value == 0 && Check.length != 0) {
            alert('Please enter an Application name')
          }
          else if (Appname.value != 0 && Check.length == 0) {
            alert('Please check Sensors')
          }
          else if (Appname.value == 0 && Check.length == 0) {
            alert('Please enter an Application name and check Sensors')
          }


        });
      }).catch((e) => {
      });

      var ActiveAppData;
      window.API.postJson(
        `/extensions/${this.id}/api/getActiveSensors`
      ).then((body) => {
        var temp = "";
        ActiveAppData = body;
        console.log(ActiveAppData);
        for (var i = 0; i < ActiveAppData.length; i++) {
          var body = `
     <tr>
     <td>${ActiveAppData[i].id}</td>
      <td>${ActiveAppData[i].keyId}</td>
      <td>${ActiveAppData[i].user}</td>
      <td>${ActiveAppData[i].issuedAt}</td>
      <td>${ActiveAppData[i].publicKey}</td>
      <td>${ActiveAppData[i].payload}</td>
      <td>${ActiveAppData[i].tokens}</td>
      <td><input type="checkbox" id="Active${i}" value="${ActiveAppData[i].id}" >
      
      </td>
      </tr>`
          temp = temp + body;
        }

        var mytab = ` <table id="tableactive" class="center">
                                    <thead>
                                        <tr>
                
                      <th>id</th>
                      <th>keyID</th>
                      <th>user</th>
                      <th>issuedAt</th>
                      <th>publicKey</th>
                      <th>payload</th>
                      <th>token</th>
                      <th>Disable</th>

                                      </tr>
                
                                    </thead>
                                    <tbody>
                                        
                      ${temp}
                                        
                                    </tbody>
                                </table>`

        active.innerHTML = mytab;
       

        Saveactive.addEventListener('click', () => {
          activethings();

            if (Check1.length != 0) {
              console.log(Check1)
              window.API.postJson(
                `/extensions/${this.id}/api/activeToDeactive`,
                {'Check1' : Check1}
              ).then((body) => {
                //console.log(JSON.stringify(body, null, 2));
              }).catch((e) => {
  
              });
            }
            else {
              alert('Please check applications to disable')
            }
          

        });


      }).catch((e) => {
      });

      var DeactiveAppData;
      window.API.postJson(
        `/extensions/${this.id}/api/getDesactiveSensors`
      ).then((body) => {
        DeactiveAppData = body;
        const deactive =
          document.getElementById('manager-token-extension-response-deactive');
        var temp1 = ""
        for (var i = 0; i < DeactiveAppData.length; i++) {
          var body = `
         <tr>
         <td>${DeactiveAppData[i].id}</td>
          <td>${DeactiveAppData[i].keyId}</td>
          <td>${DeactiveAppData[i].user}</td>
          <td>${DeactiveAppData[i].issuedAt}</td>
          <td>${DeactiveAppData[i].publicKey}</td>
          <td>${DeactiveAppData[i].payload}</td>
          <td>${DeactiveAppData[i].tokens}</td>
          <td><input type="checkbox" id="Deactive${i}" value="${DeactiveAppData[i].id}" >
          
          </td>
          </tr>`
          var temp1 = temp1 + body;
        }

        var mytab1 = ` <table id="tabledeactive" class="center">
                                        <thead>
                                            <tr>
                    
                          <th>id</th>
                          <th>keyID</th>
                          <th>user</th>
                          <th>issuedAt</th>
                          <th>publicKey</th>
                          <th>payload</th>
                          <th>token</th>
                          <th>Enable</th>
    
                                          </tr>
                    
                                        </thead>
                                        <tbody>
                                            
                          ${temp1}
                                            
                                        </tbody>
                                    </table>`


        deactive.innerHTML = mytab1;


        Savedeactive.addEventListener('click', () => {
          deactivethings()
          if (Check2.length != 0) {
            console.log(Check2)
            window.API.postJson(
              `/extensions/${this.id}/api/deactiveToActive`,
              {'Check2' : Check2}
            ).then((body) => {
              //console.log(JSON.stringify(body, null, 2));
            }).catch((e) => {

            });
          }
          else {
            alert('Please check applications to enable')
          }
  
  
        });

      }).catch((e) => {
      });


























      function activethings() {

        for (var j = 0; j < ActiveAppData.length; j++) {
          CheckedActiveApps[j] = document.getElementById("Active" + j)
        }

        for (var j = 0; j < ActiveAppData.length; j++) {
          if (CheckedActiveApps[j].checked) {
            Check1[j] = ActiveAppData[j].keyId
          }
          else {
            Check1[j] = null
          }
        }
        Check1 = Check1.filter(function (el) {
          return el != null
        })
      }

      function deactivethings() {

        for (var j = 0; j < DeactiveAppData.length; j++) {
          CheckeDeactiveApps[j] = document.getElementById("Deactive" + j)
        }

        for (var j = 0; j < DeactiveAppData.length; j++) {
          if (CheckeDeactiveApps[j].checked) {
            Check2[j] = DeactiveAppData[j].keyId
          }
          else {
            Check2[j] = null
          }
        }
        Check2 = Check2.filter(function (el) {
          return el != null
        })

      }

    }
  }
  new TokenManager();
})();