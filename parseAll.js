var  fs = require('fs'),
	 co = require('co'),
	 sql = require('mssql'),
	 dir3 ="d:\\";	// общая папка для BO

var config = {
    user: '**',
    password: '**',
    server: '***', 
    database: 'REGLAM'
}
	
//	var curMon = (new Date()).getMonth()+1  // Текущий месяц, для формирования отчёта о простое вне оборота за текущий месяц
	var curMon = '11'  // Текущий месяц, для формирования отчёта о простое вне оборота за текущий месяц

	function getSyncData(RV){
		return new Promise(function(resolve,reject){
				var request = new sql.Request();
				request.query(`select date, kr,pl,pv,cs,css,cst,rfr,pr,tr,cmv,mnv,ftg,zrv from rvprostoi  WHERE date LIKE '%.%${curMon}.%' order by date`,
					function(err, recordset){
						if (err)
							reject(err);
						resolve({RV:RV,recordset:recordset})	
					}
				);
		})
	}
	sql.connect(config, function(err) {
		if (err)
			console.log(`Error: Что-то с соединением\n${err}`)
			co(function* (){
				var arr ='kr,pl,pv,cs,rfr,pr,tr,cmv,mnv,ftg,zrv'.split(',')
				for (var i=0; i<arr.length;i++){
					yield getSyncData(arr[i]).then(function(res){
						var stream = fs.createWriteStream(dir3+"\\new\\rv_prostoi_"+res.RV+".txt");
						stream.write('date_rvpr pv_rvpr\n');
						res.recordset.map(function(a){
							if (res.RV=='cs'){
								stream.write(a.date+" "+ (+a['cs']+ +a['css']+ +a['cst'])+'\n');
							}
							else 
								stream.write(a.date+" "+a[res.RV]+'\n');
						})	
					}).catch(function(err){
						console.log(err)
					})
				}
			})
	})
	
	sql.close()
