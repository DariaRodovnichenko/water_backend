export default
  {
    "openapi": "3.0.1",
    "info": {
      "version": "2.1.3",
      "title": "Swagger Water API documentation",
      "description": "Showing off swagger-ui-express",
      "license": {
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
      }
    },
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "servers": [
      { "url": "https://water-backend-4k0b.onrender.com" },
      { "url": "http://localhost:3000" }
    ],
    "tags": [
      {
        "name": "Auth",
        "description": "Authorization endpoints"
      },
      {
        "name": "Water",
        "description": "Water comsumption endpoints"
      }
    ],


    "paths": {
      "/api/auth/signup": {
        "post": {
          "tags": ["Auth"],
          "summary": "User registration",
          "parameters": [],
          "requestBody": {
            "description": "Registration's object",
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegistrationRequest"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RegistrationResponse"
                  }
                }
              }
            },
            "400": {
              "description": "Bad request (invalid request body)",
              "content": {}
            },
            "409": {
              "description": "Provided email already exists",
              "content": {}
            }
          }
        }
      },
      "/api/auth/signin": {
        "post": {
          "tags": ["Auth"],
          "summary": "User sign in",
          "parameters": [],
          "requestBody": {
            "description": "Sign-in object",
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SignInRequest"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SignInResponse"
                  }
                }
              }
            },
            "400": {
              "description": "Bad request (invalid request body)",
              "content": {}
            },
            "409": {
              "description": "Provided email already exists",
              "content": {}
            }
          }
        }
      },
      "/api/auth/current": {
        "get": {
          "tags": ["Auth"],
          "summary": "Get current user",
          "parameters": [],
          "security": [{ "Bearer": [] }],
          "responses": {
            "200": {
              "description": "Successful operation",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuthCurrentResponse"
                  }
                }
              }
            },
            "400": {
              "description": "Bad request (Authorization header not found)",
              "content": {}
            },
            "401": {
              "description": "invalid token",
              "content": {}
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "RegistrationRequest": {
          "type": "object",
          "required": ["email", "password"],
          "properties": {
            "email": {
              "type": "string",
              "description": "User's email",
              "format": "email"
            },
            "password": {
              "type": "string",
              "description": "User's password",
              "example": "qwerty123"
            }
          }
        },
        "RegistrationResponse": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "email": {
                "type": "string",
                "description": "User's email",
                "format": "email"
              },
              "userId": {
                "type": "number",
                "description": "User's id",
                "example": "32143232436545474"
              }
            }
          },
          "example": [
            { "email": "1@gmail.com", "userId": "1" },
            { "email": "2@gmail.com", "userId": "2" }
          ]
        },
        "AuthCurrentResponse": {
          "type": "object",
          "properties": {
            "userId": {
              "type": "string",
              "description": "User's id",
              "example": "66555d71857b1630586974a0"
            },
            "email": {
              "type": "string",
              "description": "User's email",
              "format": "email"
            }
          }
        },
        "SignInRequest": {
          "type": "object",
          "required": ["email", "password"],
          "properties": {
            "email": {
              "type": "string",
              "description": "User's email",
              "format": "email",
              "example": "email5@example.com"

            },
            "password": {
              "type": "string",
              "description": "User's password",
              "example": "qwerty123"
            }
          }
        },
        "SignInResponse": {
          "type": "object",
          "properties": {
            "token": {
              "type": "string",
              "description": "User's token",
              "format": "token"
            }
          },
          "example":
          {
            "token": "eyJhbGciOiJIUzI1NiIsInRpXVCasdfasDcxODU3YjE2MzA1ODY5NzRhMCIsImlhdCI6MTcxMTkwODAzMCwiZXhwIjoxNzExOTkwODMwfQ.gpjD2TtfIoVgVN9j4rerT73LN1XaOeHR6MAtWyXULQs"
          }
        }
      },
      "securitySchemes": {
        "Bearer": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      }
    }
  }