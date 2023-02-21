/*
API

Audius V1 API

API version: 1.0
*/

// Code generated by OpenAPI Generator (https://openapi-generator.tech); DO NOT EDIT.

package codegen

import (
	"encoding/json"
)

// checks if the EncodedUserId type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &EncodedUserId{}

// EncodedUserId struct for EncodedUserId
type EncodedUserId struct {
	UserId *string `json:"user_id,omitempty"`
}

// NewEncodedUserId instantiates a new EncodedUserId object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewEncodedUserId() *EncodedUserId {
	this := EncodedUserId{}
	return &this
}

// NewEncodedUserIdWithDefaults instantiates a new EncodedUserId object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewEncodedUserIdWithDefaults() *EncodedUserId {
	this := EncodedUserId{}
	return &this
}

// GetUserId returns the UserId field value if set, zero value otherwise.
func (o *EncodedUserId) GetUserId() string {
	if o == nil || IsNil(o.UserId) {
		var ret string
		return ret
	}
	return *o.UserId
}

// GetUserIdOk returns a tuple with the UserId field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *EncodedUserId) GetUserIdOk() (*string, bool) {
	if o == nil || IsNil(o.UserId) {
		return nil, false
	}
	return o.UserId, true
}

// HasUserId returns a boolean if a field has been set.
func (o *EncodedUserId) HasUserId() bool {
	if o != nil && !IsNil(o.UserId) {
		return true
	}

	return false
}

// SetUserId gets a reference to the given string and assigns it to the UserId field.
func (o *EncodedUserId) SetUserId(v string) {
	o.UserId = &v
}

func (o EncodedUserId) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o EncodedUserId) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.UserId) {
		toSerialize["user_id"] = o.UserId
	}
	return toSerialize, nil
}

type NullableEncodedUserId struct {
	value *EncodedUserId
	isSet bool
}

func (v NullableEncodedUserId) Get() *EncodedUserId {
	return v.value
}

func (v *NullableEncodedUserId) Set(val *EncodedUserId) {
	v.value = val
	v.isSet = true
}

func (v NullableEncodedUserId) IsSet() bool {
	return v.isSet
}

func (v *NullableEncodedUserId) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableEncodedUserId(val *EncodedUserId) *NullableEncodedUserId {
	return &NullableEncodedUserId{value: val, isSet: true}
}

func (v NullableEncodedUserId) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableEncodedUserId) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


