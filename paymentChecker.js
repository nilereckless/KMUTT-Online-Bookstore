var orderHistoryController = require('./controller/orderHistoryController');
var moment = require('moment');


async function paymentChecker() {
    console.log('Checking Payment Status');
    var orders = await orderHistoryController.getAllOrderHistory()
    if (orders.length > 0) {
        orders.forEach(order => {
            var a = moment();//now
            var b = moment(order.created_at);

            // console.log(a.diff(b, 'seconds')) // 745
            var minutes = a.diff(b, 'minutes') // 44700
            // console.log(a.diff(b, 'hours')) // 745

            if (minutes >= 2 && order.status === "pending") {
                console.log("expired payment", order.order_id);
                orderHistoryController.updateOrderStatusByID(order.order_id, "Declined")
            }
        });
    }

}



setInterval(paymentChecker, 3000);
