import uuid from "react-uuid";
import { useLanguage } from "../../context/GlobalContext";
import { formatNumberES } from '../../helpers/utils';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglass } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { http } from "../../helpers/http";
import { ORDERS_ENDPOINT } from "../../configuration";

const Orders = () => {

  const { text } = useLanguage();
  const { user_state } = useAuth();

  const [orders, setOrders] = useState([]);




  useEffect(() => {
    const setUserOrders = async () => {
      let array = [];
      const orders = await http()
        .get(`${ORDERS_ENDPOINT}/get/all/${user_state.id}`)
        .then(ordersBackend => {
          return ordersBackend;
        });
      await orders.map(async (ord, ind) => {
        const result = await http().get(`${ORDERS_ENDPOINT}/get/products/${ord.id}`)
          .then(productsBackend => {
            return productsBackend;
          });
        const newOrd = { ...ord, products: result }
        array.push(newOrd);
        if (ind === orders.length - 1) setOrders(array);
      });
    }
    setUserOrders();
  }, [])


  return (
    <div className='orders'>
      <div className="orders__titles">
        <p className="orders__titles--key">#</p>
        <p className="orders__titles--key">{text.payment.address}</p>
        <p className="orders__titles--key">{text.payment.products}</p>
        <p className="orders__titles--key">{text.payment.total}</p>
      </div>
      {
        orders.length > 0
          ?
          orders.map(({ id, address, price, products }) => {
            return (
              <div className="orders__order" key={uuid()}>
                <p className="orders__order--val">{id}</p>
                <p className="orders__order--val">{address}</p>
                <div>
                  {
                    products.map(({ name }) => {
                      return (
                        <p key={uuid()} className="orders__order--val">{name}</p>
                      )
                    })
                  }
                </div>
                <p className="orders__order--val">{formatNumberES(price)} €</p>
              </div>
            )
          })
          :
          <FontAwesomeIcon className="orders__empty" icon={faHourglass} />
      }
    </div>
  )
}

export default Orders;