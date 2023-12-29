module.exports = {
  "swagger": "2.0",
  "info": {
    "version": "1.0.0",
    "title": "vibecoin",
    "description": "vibecoin API"
  },
  "securityDefinitions": {
    "bearerAuth": {
      "type": "apiKey",
      "name": "Authorization",
      "description": "Type in the ‘Value’ input box below: ‘Bearer #JWT#’, where JWT is the token",
      "scheme": "bearer",
      "in": "header",
      "value": "Bearer <JWT>"
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "host": process.env.DEVELOPMENT,
  "basePath": "/api/v1/",
  "tags": [
    {
      "name": "Auth"
    },
    {
      "name": "User"
    },
    {
      "name": "Friends"
    },
    {
      "name": "Business"
    },
    {
      "name": "Store"
    },
    {
      "name": "Loyalty Card"
    },
    {
      "name": "Promotion"
    },
    {
      "name": "Plan"
    },
    {
      "name": "Payment Gateway"
    },
    {
      "name": "Account"
    }
  ],
  "schemes": [
    "http",
    "https"
  ],
  "consumes": [
    "application/json"
  ],
  "produces": [
    "application/json"
  ],
  "paths": {
    "/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "User Login",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "email",
                "password"
              ],
              "properties": {
                "email": {
                  "type": "string"
                },
                "password": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "You have been login successfully."
          }
        }
      }
    },
    "/registration": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "User Registration",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "first_name",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "last_name",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "profile_photo",
            "in": "formData",
            "type": "file",
            "required": true
          },
          {
            "name": "email",
            "type": "string",
            "format": "email",
            "example": "user@example.com",
            "in": "formData",
            "required": true
          },
          {
            "name": "password",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "fcm_token",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "device_type",
            "type": "number",
            "description": "1: Android, 2: Apple",
            "in": "formData",
            "required": true
          },
          {
            "name": "login_type",
            "type": "number",
            "description": "1: Normal, 2: Google, 3: Facebook, 4: Apple",
            "in": "formData",
            "required": true
          },
          {
            "name": "social_media_id",
            "type": "string",
            "in": "formData"
          }
        ],
        "responses": {
          "200": {
            "description": "User has been added successfully, otp sent to you email ID, please very it."
          }
        }
      }
    },
    "/verifyMail": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "Verify user email",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "email",
                "otp"
              ],
              "properties": {
                "email": {
                  "type": "string"
                },
                "otp": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Email has been verified successfully."
          }
        }
      }
    },
    "/resendOtp": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "Verify user email Resend OTP",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "email"
              ],
              "properties": {
                "email": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Email has been send to your email address."
          }
        }
      }
    },
    "/forgotPassword": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "Please check your email for OTP",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "email"
              ],
              "properties": {
                "email": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Send OTP in email successfully."
          }
        }
      }
    },
    "/resetPassword": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "Reset password",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "email",
                "otp",
                "password"
              ],
              "properties": {
                "email": {
                  "type": "string"
                },
                "otp": {
                  "type": "string"
                },
                "password": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Password has been reset successfully."
          }
        }
      }
    },
    "/changePassword": {
      "post": {
        "tags": [
          "Auth"
        ],
        "description": "Change password",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "old_password",
                "password"
              ],
              "properties": {
                "old_password": {
                  "type": "string"
                },
                "password": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Password has been changed successfully."
          }
        }
      }
    },
    "/socialAccoutExist": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "check social account exist or not.",
        "parameters": [
          {
            "name": "email",
            "in": "query",
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        }
      },
    },
    "/user_details": {
      "get": {
        "tags": [
          "User"
        ],
        "summary": "Get user details",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        }
      }
    },
    "/user": {
      "put": {
        "tags": [
          "User"
        ],
        "summary": "Edit user details",
        "description": "Edit user details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "apt_suite",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "street_address",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "city",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "country",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "latitude",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "longitute",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "nick_name",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "first_name",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "last_name",
            "type": "string",
            "in": "formData",
            "required": false
          },
          {
            "name": "phone",
            "type": "number",
            "in": "formData",
            "required": false
          },
          {
            "name": "profile_photo",
            "in": "formData",
            "type": "file"
          },
          {
            "name": "your_job",
            "type": "string",
            "in": "formData"
          }
        ],
        "responses": {
          "200": {
            "description": "Your profile detail updated successfully."
          }
        }
      }
    },
    "/sendFriendRequest": {
      "post": {
        "tags": [
          "Friends"
        ],
        "summary": "Send Friend Request",
        "description": "Send Friend Request",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "$ref": "#/definitions/Friends"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "User has successfully send the friend request."
          }
        }
      },
    },
    "/acceptRejectFriendRequest": {
      "post": {
        "tags": [
          "Friends"
        ],
        "summary": "Accpted/Reject Friend Request",
        "description": "Accpted/Reject Friend Request",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "$ref": "#/definitions/AcceptRejectFriends"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "User has successfully send the friend request."
          }
        }
      },
    },
    "/friends": {
      "get": {
        "tags": [
          "Friends"
        ],
        "summary": "Get all friends",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Friends"
            }
          }
        }
      }
    },
    "/nonFriends": {
      "get": {
        "tags": [
          "Friends"
        ],
        "summary": "Get all non friends",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Friends"
            }
          }
        }
      }
    },
    "/pendingFriendRequest": {
      "get": {
        "tags": [
          "Friends"
        ],
        "summary": "Get all pending friends",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Friends"
            }
          }
        }
      }
    },
    "/businesses": {
      "get": {
        "tags": [
          "Business"
        ],
        "summary": "Get all business",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Business"
            }
          }
        }
      }
    },
    "/business": {
      "post": {
        "tags": [
          "Business"
        ],
        "summary": "Add business details",
        "description": "Add business details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "name",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "photo",
            "in": "formData",
            "type": "file"
          },
          {
            "name": "description",
            "type": "string",
            "in": "formData"
          }
        ],
        "responses": {
          "200": {
            "description": "Business has been added successfully."
          }
        }
      },
      "put": {
        "tags": [
          "Business"
        ],
        "summary": "Edit business details",
        "description": "Edit business details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "id",
            "type": "number",
            "in": "formData",
            "required": true
          },
          {
            "name": "name",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "photo",
            "in": "formData",
            "type": "file"
          },
          {
            "name": "description",
            "type": "string",
            "in": "formData"
          }
        ],
        "responses": {
          "200": {
            "description": "Business has been updated successfully."
          }
        }
      },
    },
    "/store_performance_analytics": {
      "get": {
        "tags": [
          "Business"
        ],
        "summary": "Store Performance analytics GET API.",
        "parameters": [
          {
            "name": "store_id",
            "in": "query",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Get_Promotion_Link"
            }
          }
        }
      },
    },
    "/follow": {
      "post": {
        "tags": [
          "Business"
        ],
        "summary": "Follow - Unfollow business",
        "description": "Follow - Unfollow business",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "$ref": "#/definitions/Follow"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Business has been followed successfully."
          }
        }
      }
    },
    "/followUnfollowBusiness": {
      "get": {
        "tags": [
          "Business"
        ],
        "summary": "Get all follow/un-follow business",
        "parameters": [
          {
            "name": "follow",
            "in": "path",
            "type": "boolean"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Business"
            }
          }
        }
      },
    },
    "/store": {
      "get": {
        "tags": [
          "Store"
        ],
        "summary": "Get all store",
        "parameters": [
          {
            "name": "business_id",
            "in": "query",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Store"
            }
          }
        }
      },
      "post": {
        "tags": [
          "Store"
        ],
        "summary": "Add store details",
        "description": "Add store details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "$ref": "#/definitions/Store"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Store has been added successfully."
          }
        }
      },
      "put": {
        "tags": [
          "Store"
        ],
        "summary": "Edit store details",
        "description": "Edit store details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "id",
            "type": "number",
            "in": "body",
          
          },
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "$ref": "#/definitions/Store"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Store has been added successfully."
          }
        }
      }
    },
    "/nearByStore": {
      "get": {
        "tags": [
          "Store"
        ],
        "summary": "Get all store of near by",
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Store"
            }
          }
        }
      },
    },
    "/store_subscribtion": {
      "post": {
        "tags": [
          "Store"
        ],
        "summary": "Add store subscribtion",
        "description": "Add store subscribtion",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "customer_id",
                "store_id",
                "plan_id"
              ],
              "properties": {
                "customer_id": {
                  "type": "string"
                },
                "store_id": {
                  "type": "number"
                },
                "plan_id": {
                  "type": "number"
                }
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Store subscribtion has been added successfully."
          }
        }
      }
    },
    "/loyaltyCard": {
      "get": {
        "tags": [
          "Loyalty Card"
        ],
        "summary": "Get all Loyalty Card",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/LoyaltyCard"
            }
          }
        }
      },
      "post": {
        "tags": [
          "Loyalty Card"
        ],
        "summary": "Add loyalty card details",
        "description": "Add loyalty card details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "store_id",
            "type": "number",
            "in": "formData",
            "required": true
          },
          {
            "name": "name",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "description",
            "type": "string",
            "in": "formData"
          },
          {
            "in": "formData",
            "name": "photo",
            "type": "array",
            "items": {
              "type": "file"
            },
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "Loyalty card added successfully."
          }
        }
      },
      "put": {
        "tags": [
          "Loyalty Card"
        ],
        "summary": "Edit Loyalty Card details",
        "description": "Edit Loyalty Card details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "id",
            "type": "number",
            "in": "formData",
            "required": true
          },
          {
            "name": "name",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "description",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "photo",
            "type": "array",
            "in": "formData",
            "items": {
              "type": "file"
            },
            "required": false
          },
          {
            "name": "delete_photo",
            "type": "string",
            "in": "formData",
            "required": false
          }
        ],
        "responses": {
          "200": {
            "description": "Loyalty card has been updated successfully."
          }
        }
      }
    },
    "/loyaltyCardDiscover": {
      "get": {
        "tags": [
          "Loyalty Card"
        ],
        "summary": "Get all Loyalty Card Discovery",
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/LoyaltyCard"
            }
          }
        }
      }
    },
    "/promotion": {
      "get": {
        "tags": [
          "Promotion"
        ],
        "summary": "Get all promotion by business id",
        "parameters": [
          {
            "name": "business_id",
            "in": "path",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Promotion"
            }
          }
        }
      }
    },
    "/promotions": {
      "get": {
        "tags": [
          "Promotion"
        ],
        "summary": "Get all promotion",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Promotion"
            }
          }
        }
      },
      "post": {
        "tags": [
          "Promotion"
        ],
        "summary": "Add promotion details",
        "description": "Add promotion details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "loyalty_card_id",
            "type": "number",
            "in": "formData",
            "required": true
          },
          {
            "name": "type",
            "type": "number",
            "description": "1-Discount / 2-Promotions / 3-Paid Referrals / 4-Cash Back",
            "in": "formData",
            "required": true
          },
          {
            "name": "customer_amount",
            "type": "number",
            "format": "float",
            "in": "formData",
            "required": true
          },
          {
            "name": "customer_referral_amount",
            "type": "number",
            "format": "float",
            "in": "formData",
            "required": true
          },
          {
            "name": "start_date",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "end_date",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "photo",
            "in": "formData",
            "type": "file"
          },
          {
            "name": "description",
            "type": "string",
            "in": "formData"
          }
        ],
        "responses": {
          "200": {
            "description": "Promotion has been added successfully."
          }
        }
      },
      "put": {
        "tags": [
          "Promotion"
        ],
        "summary": "Edit promotion details",
        "description": "Edit promotion details",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "id",
            "type": "number",
            "in": "formData",
            "required": true
          },
          {
            "nameStore": "loyalty_card_id",
            "type": "number",
            "in": "formData",
            "required": true
          },
          {
            "name": "type",
            "type": "number",
            "in": "formData",
            "required": true
          },
          {
            "name": "customer_amount",
            "type": "number",
            "format": "float",
            "in": "formData",
            "required": true
          },
          {
            "name": "customer_referral_amount",
            "type": "number",
            "format": "float",
            "in": "formData",
            "required": true
          },
          {
            "name": "start_date",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "end_date",
            "type": "string",
            "in": "formData",
            "required": true
          },
          {
            "name": "photo",
            "in": "formData",
            "type": "file"
          },
          {
            "name": "description",
            "type": "string",
            "in": "formData"
          }
        ],
        "responses": {
          "200": {
            "description": "Promotion has been updated successfully."
          }
        }
      }
    },
    "/posts": {
      "get": {
        "tags": [
          "Promotion"
        ],
        "summary": "Get all promotion is upvotes exist.",
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Promotion"
            }
          }
        }
      }
    },
    "/newsFeed": {
      "get": {
        "tags": [
          "Promotion"
        ],
        "summary": "Get all promotion of followed business with upvotes status.",
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Promotion"
            }
          }
        }
      },
    },
    "/upvotes": {
      "post": {
        "tags": [
          "Promotion"
        ],
        "summary": "Upvotes promotion",
        "description": "Upvotes promotion",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "$ref": "#/definitions/Get_Promotion_Link"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Upvoted Successfully."
          }
        }
      }
    },
    "/promotionReferralsLink": {
      "get": {
        "tags": [
          "Promotion"
        ],
        "summary": "Generate encrypted link of promotion and user id.",
        "parameters": [
          {
            "name": "promotion_id",
            "in": "query",
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "$ref": "#/definitions/Get_Promotion_Link"
            }
          }
        }
      },
    },
    "/savePromotionReferrals": {
      "post": {
        "tags": [
          "Promotion"
        ],
        "summary": "Add referrals to the user",
        "description": "Add referrals to the user",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "$ref": "#/definitions/Add_Promotion_Referrals"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Promotion referrals has been added successfully."
          }
        }
      }
    },
    "/plan": {
      "get": {
        "tags": [
          "Plan"
        ],
        "summary": "Get plan list",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/cards/{customer_id}": {
      "get": {
        "tags": [
          "Payment Gateway"
        ],
        "parameters": [
          {
            "name": "customer_id",
            "in": "path",
            "type": "string"
          }
        ],
        "summary": "Get card list",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/cards": {
      "post": {
        "tags": [
          "Payment Gateway"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "customer_id",
                "number",
                "exp_month",
                "exp_year",
                "cvc"
              ],
              "properties": {
                "customer_id": {
                  "type": "string"
                },
                "number": {
                  "type": "number"
                },
                "exp_month": {
                  "type": "number"
                },
                "exp_year": {
                  "type": "number"
                },
                "cvc": {
                  "type": "number"
                }
              }
            }
          }
        ],
        "summary": "Create new card",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "Payment Gateway"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "customer_id",
                "card_id"
              ],
              "properties": {
                "customer_id": {
                  "type": "string"
                },
                "card_id": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "summary": "remove card",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "put": {
        "tags": [
          "Payment Gateway"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "customer_id",
                "card_id"
              ],
              "properties": {
                "customer_id": {
                  "type": "string"
                },
                "card_id": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "summary": "To make card default",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/balance": {
      "get": {
        "tags": [
          "Account"
        ],
        "summary": "Get vibecoin balance",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "type": "number"
          },
          {
            "name": "type",
            "in": "query",
            "type": "number",
            "description": "1: User, 2: Business, 3: Store",
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/limit_balance": {
      "get": {
        "tags": [
          "Account"
        ],
        "summary": "Get vibecoin limit balance",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "type": "number"
          },
          {
            "name": "type",
            "in": "query",
            "type": "number",
            "description": "1: User, 2: Business",
          }
        ],
        "responses": {
          "200": {
            "description": "Vibecoin limit balance."
          }
        }
      }
    },
    "/transfer_vibecoin": {
      "post": {
        "tags": [
          "Account"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "reference_id",
                "referral_id",
                "from_type",
                "to_address",
                "amount"
              ],
              "properties": {
                "reference_id": {
                  "type": "number",
                  "description": "Primary id of User, business, or Store",
                },
                "referral_id": {
                  "type": "number",
                },
                "from_type": {
                  "type": "number",
                  "description": "1: User, 2: business, 3: Store",
                },
                "to_address": {
                  "type": "string"
                },
                "amount": {
                  "type": "number"
                }
              }
            }
          }
        ],
        "summary": "Transfer vibecoin",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "Account"
        ],
        "summary": "Transfer vibecoin transaction list",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "type": "number"
          },
          {
            "name": "type",
            "in": "query",
            "type": "number",
            "description": "1: User 2: Business 3: Store",
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/purchase_vibecoin": {
      "post": {
        "tags": [
          "Account"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "payload",
            "in": "body",
            "schema": {
              "type": "object",
              "required": [
                "amount",
                "type",
                "transaction_id"
              ],
              "properties": {
                "amount": {
                  "type": "number"
                },
                "type": {
                  "type": "number",
                  "description": "1: User, 2: business",
                },
                "transaction_id": {
                  "type": "string"
                }
              }
            }
          }
        ],
        "summary": "Purchase vibecoin",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "Account"
        ],
        "summary": "Purchase vibecoin transaction list",
        "parameters": [
          {
            "name": "buyer_id",
            "in": "query",
            "type": "number"
          },
          {
            "name": "type",
            "in": "query",
            "type": "number",
            "description": "1: User, 2: Business",
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  },
  "definitions": {
    "User": {
      "required": [
        "email",
        "first_name",
        "last_name"
      ],
      "properties": {
        "nick_name": {
          "type": "string"
        },
        "first_name": {
          "type": "string"
        },
        "last_name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        }
      }
    },
    "Store": {
      "required": [
        "business_id",
        "apt_suite",
        "street_address",
        "city",
        "country",
        "latitude",
        "longitute",
        "name",
        "admin_email"
      ],
      "properties": {
        "business_id": {
          "type": "number"
        },
        "apt_suite": {
          "type": "string"
        },
        "street_address": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "latitude": {
          "type": "number",
          "format": "float"
        },
        "longitute": {
          "type": "number",
          "format": "float"
        },
        "admin_email": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        }
      }
    },
    "Promotion": {
      "required": [
        "type",
        "customer_amount",
        "customer_referral_amount",
        "start_date",
        "end_date",
        "description",
        "photo"
      ],
      "properties": {
        "type": {
          "type": "string"
        },
        "customer_amount": {
          "type": "string"
        },
        "customer_referral_amount": {
          "type": "string"
        },
        "start_date": {
          "type": "string"
        },
        "end_date": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "qr_code": {
          "type": "string"
        },
        "photo": {
          "type": "string"
        }
      }
    },
    "Get_Promotion_Link": {
      "required": [
        "promotion_id"
      ],
      "properties": {
        "promotion_id": {
          "type": "number"
        }
      }
    },
    "Add_Promotion_Referrals": {
      "required": [
        "encrypted",
        "to_id",
      ],
      "properties": {
        "encrypted": {
          "type": "string"
        },
        "to_id": {
          "type": "number"
        },
      }
    },
    "LoyaltyCard": {
      "required": [
        "store_id",
        "business_id",
        "name",
        "description"
      ],
      "properties": {
        "store_id": {
          "type": "number"
        },
        "business_id": {
          "type": "number"
        },
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        }
      }
    },
    "Business": {
      "required": [
        "name",
        "fund",
        "photo",
        "description"
      ],
      "properties": {
        "name": {
          "type": "string"
        },
        "fund": {
          "type": "number"
        },
        "photo": {
          "type": "string"
        },
        "description": {
          "type": "string"
        }
      }
    },
    "StorePerformanceAnalytics": {
      "required": [
        "store_id"
      ],
      "properties": {
        "store_id": {
          "type": "number"
        }
      }
    },
    "Follow": {
      "required": [
        "business_id"
      ],
      "properties": {
        "business_id": {
          "type": "number"
        }
      }
    },
    "Friends": {
      "required": [
        "to_id"
      ],
      "properties": {
        "to_id": {
          "type": "number"
        }
      }
    },
    "AcceptRejectFriends": {
      "required": [
        "to_id",
        "status"
      ],
      "properties": {
        "to_id": {
          "type": "number"
        },
        "status": {
          "type": "number"
        }
      }
    },
  }
}