require('dotenv').config();

const logIn = async (type = 1) => {
  try {
    let backendUrl = "";
    let username = "";
    let password = "";
    console.log("process.env.LNBIT_URL", process.env.LNBIT_URL)
    console.log("process.env.LNBIT_URL_2", process.env.LNBIT_URL_2)

    console.log("process.env.LNBIT_USERNAME", process.env.LNBIT_USERNAME)
    console.log("process.env.LNBIT_PASS", process.env.LNBIT_PASS)

    console.log("process.env.LNBIT_USERNAME_2", process.env.LNBIT_USERNAME_2)
    console.log("process.env.LNBIT_PASS2", process.env.LNBIT_PASS_2)
    console.log("type-->", type)
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      username = process.env.LNBIT_USERNAME;
      password = process.env.LNBIT_PASS;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      username = process.env.LNBIT_USERNAME_2;
      password = process.env.LNBIT_PASS_2;
    }
    // Fixed IP address as used in curl commands
    let response = await fetch(`${backendUrl}api/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    response = await response.json();
    console.log("response login2 ", username,
      password, backendUrl, type, response)
    if (response?.access_token) {
      return {
        status: true,
        data: { token: response?.access_token },
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const userLogIn = async (type = 1, usr) => {
  try {
    let backendUrl = "";
    let username = "";
    let password = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      username = process.env.LNBIT_USERNAME;
      password = process.env.LNBIT_PASS;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      username = process.env.LNBIT_USERNAME_2;
      password = process.env.LNBIT_PASS_2;
    }
    // Fixed IP address as used in curl commands
    let response = await fetch(`${backendUrl}api/v1/auth/usr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usr
      }),
    });
    response = await response.json();
    if (response?.access_token) {
      return {
        status: true,
        data: { token: response?.access_token },
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};


const createUser = async (data, token, type = 1) => {
  try {
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      apiKey = process.env.LNBIT_API_KEY_2;
    }
    // LNBIT_API_KEY  ,   process.env.LNBIT_URL
    let response = await fetch(`${backendUrl}users/api/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    console.log("response create user", response)

    if (response?.email) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const addUserWallet = async (id, data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      apiKey = process.env.LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}users/api/v1/user/${id}/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    console.log("addUserWallet response 179-->", response)
    if (response?.adminkey) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.log("add user wallet error-->", error)
    return {
      status: false,
      msg: "fetch failed",
    };
  }
}



// splitpayments/api/v1/targets
const splitPaymentTarget = async (data, apiKey, token, type = 1) => {
  try {
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    // LNBIT_API_KEY  ,   process.env.LNBIT_URL
    let response = await fetch(`${backendUrl}splitpayments/api/v1/targets`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    console.log("response splitPaymentTarget", response)

    if (response?.detail) {
      return {
        status: false,
        msg: response?.detail,
      };
    } else {
      return {
        status: true,
        data: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};



// create lnurlpCreate link
const lnurlpCreate = async (data, apiKey, token, type = 1) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    // LNBIT_API_KEY  ,   process.env.LNBIT_URL
    console.log("backendUrl-->", backendUrl, data, token, apiKey)
    let response = await fetch(`${backendUrl}lnurlp/api/v1/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    console.log("response lnurlpCreate ", response)

    if (response?.detail) {
      return {
        status: false,
        msg: response?.detail,
      };
    } else {
      return {
        status: true,
        data: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};





// update updateLnurlp link
const updateLnurlp = async (data, apiKey, token, type = 1, id) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    // LNBIT_API_KEY  ,   process.env.LNBIT_URL
    let response = await fetch(`${backendUrl}lnurlp/api/v1/links/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.detail) {
      return {
        status: false,
        msg: response?.detail,
      };
    } else {
      return {
        status: true,
        data: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};



// create lnurlpCreate link
const withdrawLinkCreate = async (data, apiKey, token, type = 1) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    // LNBIT_API_KEY  ,   process.env.LNBIT_URL
    console.log("backendUrl-->", backendUrl, data, token, apiKey)
    let response = await fetch(`${backendUrl}withdraw/api/v1/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    console.log("response withdrawLinkCreate ", response)

    if (response?.detail) {
      return {
        status: false,
        msg: response?.detail,
      };
    } else {
      return {
        status: true,
        data: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};




// get lnurlp Withdraw link
const getWithdrawLinkCreate = async (apiKey, token, type = 1) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    // LNBIT_API_KEY  ,   process.env.LNBIT_URL
    let response = await fetch(`${backendUrl}withdraw/api/v1/links?all_wallets=true&limit=10&offset=0`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });
    response = await response.json();
    console.log("getWithdrawLinkCreate-->", response)
    if (response?.detail) {
      return {
        status: false,
        msg: response?.detail,
      };
    } else {
      return {
        status: true,
        data: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};



// get lnurlp Withdraw link
const getPayLnurlpLink = async (apiKey, token, type = 1) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    // LNBIT_API_KEY  ,   process.env.LNBIT_URL
    let response = await fetch(`${backendUrl}lnurlp/api/v1/links?all_wallets=true`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });
    response = await response.json();
    console.log("getPayLnurlpLink-->", backendUrl, response)

    if (response?.detail) {
      return {
        status: false,
        msg: response?.detail,
      };
    } else {
      return {
        status: true,
        data: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};



const getUser = async (id, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;

      apiKey = process.env.LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}users/api/v1/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });
    response = await response.json();
    console.log("response get user", response)

    if (response?.email) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createTpos = async (data, apiKey, token, type = 1) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    console.log("type", backendUrl, apiKey)
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}tpos/api/v1/tposs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    console.log("createTpos 399-->", response)
    if (response?.id) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createBlotzAutoReverseSwap = async (data, apiKey, token, type = 1) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(
      `${process.env.LNBIT_URL}boltz/api/v1/swap/reverse/auto`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(data),
      }
    );
    response = await response.json();
    console.log("response-> createBlotzAutoReverseSwap", type, response)
    if (response?.id) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createInvoice = async (data, token, type = 1, apiKey) => {
  try {
    let backendUrl = "";
    // let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      // apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      // apiKey = process.env.LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.bolt11) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};


const createTposInvoice = async (data, tpoId) => {
  try {
    let backendUrl = process.env.LNBIT_URL;
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}tpos/api/v1/tposs/${tpoId}/invoices`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        status: false,
        msg: errorData?.detail || `API error with status ${response.status}`
      };
    }
    response = await response.json();
    return {
      status: true,
      data: response,
    };
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const payInvoice = async (data, token, type = 1, apiKey) => {
  try {
    let backendUrl = "";
    // let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      // apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      // apiKey = process.env.LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.payment_hash) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createSwapReverse = async (data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      apiKey = process.env.LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}boltz/api/v1/swap/reverse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.invoice) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createSwap = async (data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      apiKey = process.env.LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}boltz/api/v1/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.address) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getStats = async (walletId, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
      apiKey = process.env.LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;

      apiKey = process.env.LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(
      `${backendUrl}api/v1/payments/stats/wallets?wallet_id=${walletId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
          "X-API-KEY": apiKey,
        },
      }
    );
    response = await response.json();
    console.log("response get user", response)

    if (response) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getPayments = async (
  token,
  type = 1,
  fromDate = null,
  toDate = null,
  tag = null,
  apiKey = null
) => {
  console.log("line-510", fromDate, toDate, apiKey);
  try {
    let backendUrl = "";
    // let apiKey = "";

    if (type === 1) {
      backendUrl = process.env.LNBIT_URL;
      // apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
      // apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }

    const params = new URLSearchParams({
      // wallet_id: walletId,
      sortby: "time",
      direction: "desc",
      limit: 10,
    });

    if (fromDate) {
      const formattedFromDate = `${fromDate}T00:00:00`;
      params.append("time[ge]", formattedFromDate);
    }

    if (toDate) {
      const formattedToDate = `${toDate}T23:59:59`;
      params.append("time[le]", formattedToDate);
    }

    if (tag) {
      params.append("tag", tag); // Only added if provided
    }

    const url = `${backendUrl}api/v1/payments/paginated?${params.toString()}`;
    console.log("line-542", url);

    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });

    response = await response.json();

    console.log("line-771", response);
    if (response?.data) {
      return {
        status: true,
        data: response?.data,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const decodeInvoice = async (invoice, token, type = 1, apiKey) => {
  try {
    let backendUrl = "";
    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }

    // Encode the invoice parameter for URL safety
    const encodedInvoice = encodeURIComponent(invoice);

    let response = await fetch(
      `${backendUrl}lndhub/ext/decodeinvoice?invoice=${encodedInvoice}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
          "X-API-KEY": apiKey,
        },
      }
    );

    response = await response.json();

    // Check if the response contains decoded invoice data
    // Common fields in decoded invoices: payment_hash, amount, description, expiry, etc.
    if (response) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail || response?.error || "Failed to decode invoice",
      };
    }
  } catch (error) {
    console.error("decodeInvoice API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};


const getWithdraw = async (token, type = 1, apiKey = null) => {
  try {
    let backendUrl = "";

    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }


    const url = `${backendUrl}boltz/api/v1/swap/reverse?all_wallets=false`;
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });

    response = await response.json();
    if (response) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getDeposit = async (token, type = 1, apiKey = null) => {
  try {
    let backendUrl = "";

    if (type == 1) {
      backendUrl = process.env.LNBIT_URL;
    } else {
      backendUrl = process.env.LNBIT_URL_2;
    }


    const url = `${backendUrl}boltz/api/v1/swap?all_wallets=false`;
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });

    response = await response.json();
    if (response) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response,
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};



module.exports = {
  logIn,
  createUser,
  getUser,
  createTpos,
  createBlotzAutoReverseSwap,
  createInvoice,
  createSwapReverse,
  createSwap,
  payInvoice,
  getStats,
  getPayments,
  addUserWallet,
  userLogIn,
  createTposInvoice,
  splitPaymentTarget,
  lnurlpCreate,
  withdrawLinkCreate,
  getWithdrawLinkCreate,
  getPayLnurlpLink,
  updateLnurlp,
  decodeInvoice,
  getWithdraw,
  getDeposit
};

