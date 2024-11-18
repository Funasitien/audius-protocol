// Code generated by go-swagger; DO NOT EDIT.

package protocol

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"encoding/json"
	"fmt"
	"io"

	"github.com/go-openapi/runtime"
	"github.com/go-openapi/strfmt"

	"github.com/AudiusProject/audius-protocol/pkg/core/gen/models"
)

// ProtocolGetBlockReader is a Reader for the ProtocolGetBlock structure.
type ProtocolGetBlockReader struct {
	formats strfmt.Registry
}

// ReadResponse reads a server response into the received o.
func (o *ProtocolGetBlockReader) ReadResponse(response runtime.ClientResponse, consumer runtime.Consumer) (interface{}, error) {
	switch response.Code() {
	case 200:
		result := NewProtocolGetBlockOK()
		if err := result.readResponse(response, consumer, o.formats); err != nil {
			return nil, err
		}
		return result, nil
	default:
		result := NewProtocolGetBlockDefault(response.Code())
		if err := result.readResponse(response, consumer, o.formats); err != nil {
			return nil, err
		}
		if response.Code()/100 == 2 {
			return result, nil
		}
		return nil, result
	}
}

// NewProtocolGetBlockOK creates a ProtocolGetBlockOK with default headers values
func NewProtocolGetBlockOK() *ProtocolGetBlockOK {
	return &ProtocolGetBlockOK{}
}

/*
ProtocolGetBlockOK describes a response with status code 200, with default header values.

A successful response.
*/
type ProtocolGetBlockOK struct {
	Payload *models.ProtocolBlockResponse
}

// IsSuccess returns true when this protocol get block o k response has a 2xx status code
func (o *ProtocolGetBlockOK) IsSuccess() bool {
	return true
}

// IsRedirect returns true when this protocol get block o k response has a 3xx status code
func (o *ProtocolGetBlockOK) IsRedirect() bool {
	return false
}

// IsClientError returns true when this protocol get block o k response has a 4xx status code
func (o *ProtocolGetBlockOK) IsClientError() bool {
	return false
}

// IsServerError returns true when this protocol get block o k response has a 5xx status code
func (o *ProtocolGetBlockOK) IsServerError() bool {
	return false
}

// IsCode returns true when this protocol get block o k response a status code equal to that given
func (o *ProtocolGetBlockOK) IsCode(code int) bool {
	return code == 200
}

// Code gets the status code for the protocol get block o k response
func (o *ProtocolGetBlockOK) Code() int {
	return 200
}

func (o *ProtocolGetBlockOK) Error() string {
	payload, _ := json.Marshal(o.Payload)
	return fmt.Sprintf("[GET /core/grpc/block/{height}][%d] protocolGetBlockOK %s", 200, payload)
}

func (o *ProtocolGetBlockOK) String() string {
	payload, _ := json.Marshal(o.Payload)
	return fmt.Sprintf("[GET /core/grpc/block/{height}][%d] protocolGetBlockOK %s", 200, payload)
}

func (o *ProtocolGetBlockOK) GetPayload() *models.ProtocolBlockResponse {
	return o.Payload
}

func (o *ProtocolGetBlockOK) readResponse(response runtime.ClientResponse, consumer runtime.Consumer, formats strfmt.Registry) error {

	o.Payload = new(models.ProtocolBlockResponse)

	// response payload
	if err := consumer.Consume(response.Body(), o.Payload); err != nil && err != io.EOF {
		return err
	}

	return nil
}

// NewProtocolGetBlockDefault creates a ProtocolGetBlockDefault with default headers values
func NewProtocolGetBlockDefault(code int) *ProtocolGetBlockDefault {
	return &ProtocolGetBlockDefault{
		_statusCode: code,
	}
}

/*
ProtocolGetBlockDefault describes a response with status code -1, with default header values.

An unexpected error response.
*/
type ProtocolGetBlockDefault struct {
	_statusCode int

	Payload *models.RPCStatus
}

// IsSuccess returns true when this protocol get block default response has a 2xx status code
func (o *ProtocolGetBlockDefault) IsSuccess() bool {
	return o._statusCode/100 == 2
}

// IsRedirect returns true when this protocol get block default response has a 3xx status code
func (o *ProtocolGetBlockDefault) IsRedirect() bool {
	return o._statusCode/100 == 3
}

// IsClientError returns true when this protocol get block default response has a 4xx status code
func (o *ProtocolGetBlockDefault) IsClientError() bool {
	return o._statusCode/100 == 4
}

// IsServerError returns true when this protocol get block default response has a 5xx status code
func (o *ProtocolGetBlockDefault) IsServerError() bool {
	return o._statusCode/100 == 5
}

// IsCode returns true when this protocol get block default response a status code equal to that given
func (o *ProtocolGetBlockDefault) IsCode(code int) bool {
	return o._statusCode == code
}

// Code gets the status code for the protocol get block default response
func (o *ProtocolGetBlockDefault) Code() int {
	return o._statusCode
}

func (o *ProtocolGetBlockDefault) Error() string {
	payload, _ := json.Marshal(o.Payload)
	return fmt.Sprintf("[GET /core/grpc/block/{height}][%d] Protocol_GetBlock default %s", o._statusCode, payload)
}

func (o *ProtocolGetBlockDefault) String() string {
	payload, _ := json.Marshal(o.Payload)
	return fmt.Sprintf("[GET /core/grpc/block/{height}][%d] Protocol_GetBlock default %s", o._statusCode, payload)
}

func (o *ProtocolGetBlockDefault) GetPayload() *models.RPCStatus {
	return o.Payload
}

func (o *ProtocolGetBlockDefault) readResponse(response runtime.ClientResponse, consumer runtime.Consumer, formats strfmt.Registry) error {

	o.Payload = new(models.RPCStatus)

	// response payload
	if err := consumer.Consume(response.Body(), o.Payload); err != nil && err != io.EOF {
		return err
	}

	return nil
}