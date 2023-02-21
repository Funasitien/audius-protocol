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

// checks if the Activity type satisfies the MappedNullable interface at compile time
var _ MappedNullable = &Activity{}

// Activity struct for Activity
type Activity struct {
	Timestamp *string `json:"timestamp,omitempty"`
	ItemType map[string]interface{} `json:"item_type,omitempty"`
	Item map[string]interface{} `json:"item,omitempty"`
}

// NewActivity instantiates a new Activity object
// This constructor will assign default values to properties that have it defined,
// and makes sure properties required by API are set, but the set of arguments
// will change when the set of required properties is changed
func NewActivity() *Activity {
	this := Activity{}
	return &this
}

// NewActivityWithDefaults instantiates a new Activity object
// This constructor will only assign default values to properties that have it defined,
// but it doesn't guarantee that properties required by API are set
func NewActivityWithDefaults() *Activity {
	this := Activity{}
	return &this
}

// GetTimestamp returns the Timestamp field value if set, zero value otherwise.
func (o *Activity) GetTimestamp() string {
	if o == nil || IsNil(o.Timestamp) {
		var ret string
		return ret
	}
	return *o.Timestamp
}

// GetTimestampOk returns a tuple with the Timestamp field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Activity) GetTimestampOk() (*string, bool) {
	if o == nil || IsNil(o.Timestamp) {
		return nil, false
	}
	return o.Timestamp, true
}

// HasTimestamp returns a boolean if a field has been set.
func (o *Activity) HasTimestamp() bool {
	if o != nil && !IsNil(o.Timestamp) {
		return true
	}

	return false
}

// SetTimestamp gets a reference to the given string and assigns it to the Timestamp field.
func (o *Activity) SetTimestamp(v string) {
	o.Timestamp = &v
}

// GetItemType returns the ItemType field value if set, zero value otherwise.
func (o *Activity) GetItemType() map[string]interface{} {
	if o == nil || IsNil(o.ItemType) {
		var ret map[string]interface{}
		return ret
	}
	return o.ItemType
}

// GetItemTypeOk returns a tuple with the ItemType field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Activity) GetItemTypeOk() (map[string]interface{}, bool) {
	if o == nil || IsNil(o.ItemType) {
		return map[string]interface{}{}, false
	}
	return o.ItemType, true
}

// HasItemType returns a boolean if a field has been set.
func (o *Activity) HasItemType() bool {
	if o != nil && !IsNil(o.ItemType) {
		return true
	}

	return false
}

// SetItemType gets a reference to the given map[string]interface{} and assigns it to the ItemType field.
func (o *Activity) SetItemType(v map[string]interface{}) {
	o.ItemType = v
}

// GetItem returns the Item field value if set, zero value otherwise.
func (o *Activity) GetItem() map[string]interface{} {
	if o == nil || IsNil(o.Item) {
		var ret map[string]interface{}
		return ret
	}
	return o.Item
}

// GetItemOk returns a tuple with the Item field value if set, nil otherwise
// and a boolean to check if the value has been set.
func (o *Activity) GetItemOk() (map[string]interface{}, bool) {
	if o == nil || IsNil(o.Item) {
		return map[string]interface{}{}, false
	}
	return o.Item, true
}

// HasItem returns a boolean if a field has been set.
func (o *Activity) HasItem() bool {
	if o != nil && !IsNil(o.Item) {
		return true
	}

	return false
}

// SetItem gets a reference to the given map[string]interface{} and assigns it to the Item field.
func (o *Activity) SetItem(v map[string]interface{}) {
	o.Item = v
}

func (o Activity) MarshalJSON() ([]byte, error) {
	toSerialize,err := o.ToMap()
	if err != nil {
		return []byte{}, err
	}
	return json.Marshal(toSerialize)
}

func (o Activity) ToMap() (map[string]interface{}, error) {
	toSerialize := map[string]interface{}{}
	if !IsNil(o.Timestamp) {
		toSerialize["timestamp"] = o.Timestamp
	}
	if !IsNil(o.ItemType) {
		toSerialize["item_type"] = o.ItemType
	}
	if !IsNil(o.Item) {
		toSerialize["item"] = o.Item
	}
	return toSerialize, nil
}

type NullableActivity struct {
	value *Activity
	isSet bool
}

func (v NullableActivity) Get() *Activity {
	return v.value
}

func (v *NullableActivity) Set(val *Activity) {
	v.value = val
	v.isSet = true
}

func (v NullableActivity) IsSet() bool {
	return v.isSet
}

func (v *NullableActivity) Unset() {
	v.value = nil
	v.isSet = false
}

func NewNullableActivity(val *Activity) *NullableActivity {
	return &NullableActivity{value: val, isSet: true}
}

func (v NullableActivity) MarshalJSON() ([]byte, error) {
	return json.Marshal(v.value)
}

func (v *NullableActivity) UnmarshalJSON(src []byte) error {
	v.isSet = true
	return json.Unmarshal(src, &v.value)
}


