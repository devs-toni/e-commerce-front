import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { useProduct } from "./ProductContext";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";
import { getMainMethods } from "../helpers/cart";
import { ACTIONS } from "../config/types";
import { http } from "../helpers/http";
import { NEW_USER_DISCOUNT, ORDERS_ENDPOINT, UI_ACTIONS, UI_SECTIONS } from "../config/configuration";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
}


export const CartProvider = ({ children }) => {

  const { productState } = useProduct();
  const { userState } = useAuth();
  const { handleUi } = useUI();
  const items = JSON.parse(localStorage.getItem(`CART-${userState.id}`));

  //TOTAL CHARGE IN CART
  const getTotalPriceCart = useCallback((products) => {
    let total = 0;
    products?.map(p => total += (parseFloat(`${p.final}`.replace('.', '')) * p.total));
    return total;
  }, []);

  const getIVAPriceCart = useCallback((products) => {
    let total = 0;
    products?.map(p => total += (parseFloat(`${p.final}`.replace('.', '')) * p.total));
    return (total * 21) / 100;
  }, [])


  const initialState = {
    cartProducts: items ? items : [],
    activeCupon: false,
    discountCupon: 0,
    isNew: false,
    discountNew: 0,
    totalAmount: items ? getTotalPriceCart(items) : 0,
    iva: items ? getIVAPriceCart(items) : 0,
  }

  const reducer = (state, action) => {
    switch (action.type) {

      case ACTIONS.MODIFY_PRODUCTS:
        return {
          ...state,
          cartProducts: action.payload,
          totalAmount: getTotalPriceCart(action.payload),
          iva: getIVAPriceCart(action.payload),
          discountNew: state.isNew ? (getTotalPriceCart(action.payload) * NEW_USER_DISCOUNT) / 100 : 0,
          activeCupon: false,
          discountCupon: 0
        };

      case ACTIONS.RESET_CART:
        return {
          cartProducts: [],
          activeCupon: false,
          discountCupon: 0,
          isNew: false,
          discountNew: 0,
          totalAmount: 0,
          iva: 0
        };

      case ACTIONS.HANDLE_CUPON:
        return {
          ...state,
          activeCupon: action.payload.active,
          totalAmount: action.payload.amount,
          iva: action.payload.iva ? action.payload.iva : getIVAPriceCart(state.cartProducts),
          discountCupon: action.payload.discount,
        };

      case ACTIONS.SET_NEW_USER_DISCOUNT:
        return {
          ...state,
          isNew: action.payload.isNew,
          discountNew: action.payload.discount,
          totalAmount: action.payload.amount,
          iva: action.payload.iva ? action.payload.iva : state.iva,
        };

      case ACTIONS.RESET_CUPON:
        return {
          ...state,
          activeCupon: false,
          discountCupon: 0
        };

      default: return state;
    }
  }

  const [cartState, dispatch] = useReducer(reducer, initialState);


  useEffect(() => {
    const items = JSON.parse(localStorage.getItem(`CART-${userState.id}`));
    dispatch({ type: ACTIONS.MODIFY_PRODUCTS, payload: items ? items : [] })

    const isNewUser = async () => {
      await http().get(`${ORDERS_ENDPOINT}/get/all/${userState.id}`)
        .then(data => {
          const isLogged = userState.id !== 0;
          const isNew = data.length === 0;
          const cuponIsActive = cartState.activeCupon;
          const cuponDiscount = cartState.discountCupon;
          const total = getTotalPriceCart(cartState.cartProducts);
          const saving = (total * NEW_USER_DISCOUNT) / 100;
          const finalPriceWithDiscount = cuponIsActive ? (total - cuponDiscount - saving) : (total - saving);
          const finalPriceWithoutDiscount = cuponIsActive ? (total - cuponDiscount) : total;
          const ivaWithDiscount = (finalPriceWithDiscount * 21) / 100;
          const ivaWithoutDiscount = (finalPriceWithoutDiscount * 21) / 100;
          if (isNew) {
            // IF IS REALLY LOGGED
            if (isLogged) {
              dispatch({ type: ACTIONS.SET_NEW_USER_DISCOUNT, payload: { isNew: isNew, discount: saving, amount: finalPriceWithDiscount, iva: ivaWithDiscount } })
            }// IF IS NOT REALLY LOGGED
            else {
              dispatch({ type: ACTIONS.SET_NEW_USER_DISCOUNT, payload: { isNew: false, discount: 0, amount: finalPriceWithoutDiscount, iva: ivaWithoutDiscount } })
            }
          }
        });
    }
    isNewUser();

    if (!userState.isAuthenticated) {
      dispatch({ type: ACTIONS.RESET_CUPON });
    }
  }, [userState.isAuthenticated])

  const getMethods = useCallback(() => {
    return getMainMethods(productState);
  }, [productState]);


  const setStorage = useCallback((products) => {
    localStorage.setItem(`CART-${userState.id}`, JSON.stringify(products));
  }, [userState.id])

  //SUM PRODUCT IN CART MODAL
  const addOneProduct = useCallback((productAdd, configurationAdd) => {
    const { handleAddProduct } = getMethods();
    const productsAdd = handleAddProduct(productAdd, configurationAdd, cartState.cartProducts);
    setStorage(productsAdd);
    dispatch({ type: ACTIONS.MODIFY_PRODUCTS, payload: productsAdd });
    handleUi(UI_SECTIONS.CUPON, UI_ACTIONS.CLOSE);

  }, [cartState.cartProducts, getMethods]);

  //REST PRODUCT IN CART MODAL
  const deleteOneProduct = useCallback((productDel, configurationDel) => {
    const { handleRemoveProduct } = getMethods();
    const productsDel = handleRemoveProduct(productDel, configurationDel, cartState.cartProducts);
    setStorage(productsDel);
    dispatch({ type: ACTIONS.MODIFY_PRODUCTS, payload: productsDel });
    handleUi(UI_SECTIONS.CUPON, UI_ACTIONS.CLOSE);

  }, [cartState.cartProducts, getMethods]);

  //ADD PRODUCTS IN PRODUCT PAGE
  const addProducts = useCallback((item, n) => {
    const { handleAddSpecificNumberProduct } = getMethods();
    const productsAddN = handleAddSpecificNumberProduct(item, n, cartState.cartProducts);
    setStorage(productsAddN);
    dispatch({ type: ACTIONS.MODIFY_PRODUCTS, payload: productsAddN });
    handleUi(UI_SECTIONS.CUPON, UI_ACTIONS.CLOSE);

  }, [productState, getMethods, cartState.cartProducts]);

  //DELETE CONFIGURATION IN CART MODAL
  const deleteConfiguration = useCallback((idProduct, idConf, totalProductInConf) => {
    const { handleRemoveConfig } = getMethods();
    const productsConfDel = handleRemoveConfig(idProduct, idConf, totalProductInConf, cartState.cartProducts);
    setStorage(productsConfDel);
    dispatch({ type: ACTIONS.MODIFY_PRODUCTS, payload: productsConfDel });
    handleUi(UI_SECTIONS.CUPON, UI_ACTIONS.CLOSE);

  }, [cartState.cartProducts, getMethods]);

  //DELETE PRODUCT IN CART MODAL
  const deleteCompleteProduct = useCallback((id) => {
    const { handleDeleteCartProduct } = getMethods();
    const productsCompleteDel = handleDeleteCartProduct(id, cartState.cartProducts);
    setStorage(productsCompleteDel);
    dispatch({ type: ACTIONS.MODIFY_PRODUCTS, payload: productsCompleteDel });
    handleUi(UI_SECTIONS.CUPON, UI_ACTIONS.CLOSE);

  }, [cartState.cartProducts, getMethods]);

  //PAYMENT COMPLETED
  const successPayment = useCallback(async (form, price, products) => {
    const { createOrder } = getMethods();
    const customerOrder = userState.isAuthenticated ? userState.id : null;
    const result = await createOrder(
      products.map(p => {
        return p.id;
      }),
      customerOrder,
      form.address,
      price
    );
    if (result) {
      localStorage.removeItem(`CART-${userState.id}`);
      handleUi(UI_SECTIONS.CUPON, UI_ACTIONS.CLOSE);
      dispatch({ type: ACTIONS.RESET_CART });
    }
  }, [userState, getMethods]);

  //SET ACTIVE CUPON
  const handleCupon = useCallback((state, percentage) => {
    const total = getTotalPriceCart(cartState.cartProducts);


    const isNew = cartState.isNew;
    let saving = 0;

    if (percentage)
      saving = (total * percentage) / 100;
    else
      saving = cartState.discountCupon;

    const finalPriceWithCupon = isNew ? (total - cartState.discountNew) - saving : total - saving;
    const finalPriceWithoutCupon = isNew ? (total - cartState.discountNew) : total;
    const ivaWithCupon = (finalPriceWithCupon * 21) / 100;
    const ivaWithoutCupon = (finalPriceWithoutCupon * 21) / 100;

    if (state)
      dispatch({ type: ACTIONS.HANDLE_CUPON, payload: { amount: finalPriceWithCupon, active: state, iva: ivaWithCupon, discount: saving } })
    else
      dispatch({ type: ACTIONS.HANDLE_CUPON, payload: { amount: finalPriceWithoutCupon, active: state, iva: ivaWithoutCupon, discount: saving } });

  }, [cartState, getTotalPriceCart]);

  const data = useMemo(() => ({
    cartState,
    addOneProduct,
    deleteOneProduct,
    addProducts,
    deleteConfiguration,
    deleteCompleteProduct,
    successPayment,
    handleCupon,
    getTotalPriceCart,
  }), [cartState, addOneProduct, deleteOneProduct, addProducts, deleteConfiguration, deleteCompleteProduct, successPayment, handleCupon, getTotalPriceCart])

  return <CartContext.Provider value={data}>{children}</CartContext.Provider>
}