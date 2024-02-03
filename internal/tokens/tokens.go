package tokens

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenManager struct {
	secretKey []byte
}

func NewTokenManager(secretKey string) TokenManager {
	tm := TokenManager{secretKey: []byte(secretKey)}
	return tm
}

type UserClaims struct {
	Id string `json:"id"`
	jwt.RegisteredClaims
}

func (tm *TokenManager) GetIdFromToken(tokenString string) (string, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signing method")
		}
		return tm.secretKey, nil
	})
	if err != nil {
		return "", err
	}
	id := token.Claims.(*UserClaims).Id
	return id, nil
}

func (tm *TokenManager) NewToken(id string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &UserClaims{
		id,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 30)),
		},
	})
	tokenString, err := token.SignedString(tm.secretKey)
	return tokenString, err
}
