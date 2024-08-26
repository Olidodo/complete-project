var express = require("express")
var cartRouter = express.Router()
cartRouter.use(express.urlencoded({ extended: false }));
cartRouter.use(express.json());
var config = require("./databaseConfig.js")
var conn = config.connection

// 添加uuid  記得npm i uuid
// 資料庫的orderlist的oid欄位，本來是CHAR(10)要改成CHAR(36)
const { v4: uuidv4 } = require('uuid');

// --------測試路由用----------
// cartRouter.get('/', function(req,res){res.send('OK')})

// cartRouter.get('/test', function(req,res){
//     conn.query("SELECT * FROM member WHERE uid = 1",function(err,result){res.json(result)})
// })
// --------測試路由用----------

//加入購物車
// cartRouter.post('/', async (req, res) => {
//     conn.query("SELECT * FROM carts WHERE uid = ? AND pid = ?", 
//         [req.body.uid, req.body.pid], function(err, results) {
//             // console.log(err,"20",results);
//             // console.log(results);
//             const amount =  results[0].amount;
            
//         if (results.length > 0) {
//             const newAmount = amount + req.body.amount;
//             if (newAmount <= req.body.quantity) {
//                 conn.query("UPDATE carts SET amount = ? WHERE uid = ? AND pid = ?", 
//                     [newAmount, req.body.uid, req.body.pid], function(err, result) {
//                     if (err) {
//                         return res.status(500).send('Update error');
//                     }
//                     // res.send('Update OK!');
//                     console.log('Update OK!');
//                 });
//             } else {
//                 res.status(400).send('添加數量超過庫存!');
//             }
//         } else {
//             // 如果紀錄不存在，插入新紀錄
//             conn.query("INSERT INTO carts (uid, pid, amount) VALUES (?, ?, ?)", 
//                 [req.body.uid, req.body.pid, req.body.amount], function(err, result) {
//                 if (err) {
//                     console.log("insert error", err);
                    
//                     return res.status(500).send('Insert error 36');
//                 }
//                 // res.send('INSERT INTO!');
//                 console.log('INSERT INTO!');
                
//             });
//         }
//         // res.redirect('/index/carts');
//     });
// });

// 加入購物車post async版本
cartRouter.post('/', async (req, res) => {
    try {
        // 使用 Promise 來包裝資料庫查詢
        const query = (sql, params) => {
            return new Promise((resolve, reject) => {
                conn.query(sql, params, (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
        };

        // 查詢是否已經存在
        const results = await query("SELECT * FROM carts WHERE uid = ? AND pid = ?", [req.body.uid, req.body.pid]);

        // 檢查查詢結果是否有資料
        if (results.length > 0) {
            const amount = results[0].amount;
            var newAmount = amount + req.body.amount;

            if (newAmount <= req.body.quantity) {
                // 更新資料
                await query("UPDATE carts SET amount = ? WHERE uid = ? AND pid = ?", [newAmount, req.body.uid, req.body.pid]);
                console.log('Update OK!');
                res.send('Update OK!');
            } else {
                await query("UPDATE carts SET amount = ? WHERE uid = ? AND pid = ?", [req.body.quantity, req.body.uid, req.body.pid]);
                console.log('Set to quantity OK!');
                res.status(400).send('添加數量超過庫存!');
            }
        } else {
            // 插入新紀錄
            await query("INSERT INTO carts (uid, pid, amount) VALUES (?, ?, ?)", [req.body.uid, req.body.pid, req.body.amount]);
            console.log('INSERT INTO!');
            res.send('Insert OK!');
        }
    } catch (err) {
        console.log('Error:', err);
        res.status(500).send('Server error');
    }
});

cartRouter.get('/:uid', function(req, res) {
    // const conn = req.app.get('connection') ???????????????????????????????????
    conn.query(
        "SELECT carts.uid, carts.pid, product.name, quantity, price, img01, amount, vendor_info.vinfo, brand_name FROM carts JOIN product ON carts.pid = product.pid JOIN vendor ON product.vid = vendor.vid JOIN vendor_info ON vendor.vinfo = vendor_info.vinfo WHERE uid = ?",
        [req.params.uid],
        function(err, result) {
            // console.log(result);
            res.json(result);
            // res.render('indexcartdetail.ejs',{products: result, turnPrice: turnPrice, total:total});
        }
    )
})

// 購物車刪除功能
cartRouter.delete('/:uid/:pid', function(req, res) {
    const { uid, pid } = req.params;
    conn.query("DELETE FROM carts WHERE uid = ? AND pid = ?",
        [uid, pid],
        function(err, result) {
    if (err) {
        return res.status(500).send('Delete error');
        }
        res.send('Delete OK!');
    });
});

// 從購物車頁面按下結帳後跳轉到結帳頁面Step1，獲取剛剛勾選的商品
cartRouter.get('/products/:pid/:uid', function(req, res) {
    conn.query(
        "SELECT product.name, quantity, price, img01, vendor_info.vinfo, brand_name FROM product JOIN vendor ON product.vid = vendor.vid JOIN vendor_info ON vendor.vinfo = vendor_info.vinfo WHERE pid = ? ",
        [req.params.pid],
        function(err, result) {
            res.json(result);
        }
    )
})

// 將結帳後的商品存入資料庫裡的orderlist
cartRouter.post('/postData', async (req, res) => {
    console.log(
      req.body.uid,
      req.body.vid,
      JSON.stringify(req.body.detail),
      JSON.stringify(req.body.send_data),
      req.body.status,
      req.body.pay
    );
    try {
      // 使用 Promise 來包裝資料庫查詢
      const query = (sql, params) => {
        return new Promise((resolve, reject) => {
          conn.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });
      };
  
      // 生成 UUID 作為訂單 ID
      const oid = uuidv4();
  
      // post 進去資料
      await query(
        "INSERT INTO `orderlist` (`oid`, `uid`, `vid`, `detail`, `send_data`, `status`, `order_time`, `pay`) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?);",
        [oid, req.body.uid, req.body.vid, JSON.stringify(req.body.detail), JSON.stringify(req.body.send_data), req.body.status, req.body.pay]
      );
      console.log('INSERT INTO!');
      res.send('Insert OK!');
    } catch (err) {
      console.log('Error:', err);
      res.status(500).send('Server error');
    }
  });

// 更新資料庫庫存
// cartRouter.put('/putData', function (req, res) {
//     conn.query("SELECT * FROM product WHERE pid = ?", [req.body.pid], function (err,result) {console.log(result)});
//     const quantity = result[0].quantity - req.body.amount;
//     conn.query("UPDATE product SET quantity = ? WHERE pid = ?;",
//         [quantity, req.body.pid],
//         function(err, result) {
//             if (err) {
//                 return res.status(500).send('Update error');
//             }
//             res.send('Update OK!');
//         }
//     );
// })

// 更新資料庫庫存-高級寫法..
cartRouter.put('/putData', function (req, res) {
    const updatePromises = req.body.items.map(item => {
        return new Promise((resolve, reject) => {
            conn.query("SELECT quantity FROM product WHERE pid = ?", [item.pid], function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                const newQuantity = result[0].quantity - item.amount;
                conn.query("UPDATE product SET quantity = ? WHERE pid = ?",
                    [newQuantity, item.pid],
                    function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });
        });
    });

    Promise.all(updatePromises)
        .then(() => res.send('All updates completed successfully'))
        .catch(err => res.status(500).send('Update error: ' + err.message));
});


module.exports = cartRouter