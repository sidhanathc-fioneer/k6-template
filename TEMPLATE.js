import http from 'k6/http';
import { group } from "k6";
import { loadOptions,loadData, parseResponse, loadServiceConfig, withHeaders } from "./lib/k6_extensions.js";

// TODO :: call loadOptions() with the name of the json options that you want to load, eg: loadOptions('default-soak-test')
//         This parameter must be supplied with a value. The directory './options/' will be searched and '.json' appended
export let options = null;

switch(__ENV.K6_TEST_TYPE){
  case 'load': options = loadOptions('default-load-test');
               break;
 case 'soak': options = loadOptions('default-soak-test');
              break;
 case 'spike': options = loadOptions('default-spike-test');
               break;
 case 'stress': options = loadOptions('default-stress-test');
              break;
  default:    options = loadOptions('default-load-test');
               break;
}


export let user = loadData('user');
export let crocodiles = loadData('crocodiles');

// TODO :: call loadServiceConfig with the name of the service that you want to load, eg: loadServiceConfig('myservice')
//         This parameter must be supplied with a value. The directory './services/' will be searched and '.json' appended
export let serviceConfig = Object.assign({}, loadServiceConfig('myservice'), {
  params: withHeaders({ "Content-Type": "application/json"})
});

export function setup() {

//  const addUserRes=http.post(serviceConfig.addUserUrl, user, serviceConfig.params)
  //parseResponse(addUserRes);

  const loginRes=http.post(serviceConfig.loginUrl, user, {});
 // console.log("loginRes  "+JSON.stringify(loginRes));
  parseResponse(loginRes);
   let authToken = loginRes.json('access');
   serviceConfig.params=withHeaders({'Content-Type': 'application/json',
                              'Authorization': 'Bearer '+authToken});
 // console.log("serviceConfig  "+JSON.stringify(serviceConfig.params));
  return serviceConfig;
   }


export default function (data) {
  // TODO :: Update `data.baseUrl` with the extension to your endpoint, eg: data.baseUrl + "public/crocodiles"
/*
  group("POST /my/crocodiles/", function() {
  parseResponse(http.post(data.addCrocodilesUrl, JSON.stringify(crocodiles), data.params));
  });
*/
  group("GET /my/crocodiles/", function() {
  parseResponse(http.get(data.getAllCrocodilesUrl, data.params));
  });
};

export function teardown(data) {
//  console.log("service config  "+JSON.stringify(data));
  /*  let crocodilesRes=http.get(data.getAllCrocodilesUrl, data.params);
      parseResponse(crocodilesRes);
    let body=JSON.parse(crocodilesRes.body);
  //  console.log("Body===============>\n\n  "+JSON.stringify(body));
    body.forEach(function(item){
    //  console.log("item  "+JSON.stringify(item));
    //    parseResponse(http.del(data.deleteCrocodilesUrl.replace('$id',item.id),{}, data.params));
      });
*/
    parseResponse(http.post(serviceConfig.logoutUrl, user, data.params));
  };
