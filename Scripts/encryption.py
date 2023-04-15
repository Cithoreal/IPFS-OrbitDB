#!/venv/Scripts/python

#To generate keys: python3 encrypt.py -g
#To encrypt a file: python3 encrypt.py -e <file_name>
#To decrypt a file: python3 encrypt.py -d <file_name>

import argparse
from cryptography.fernet import Fernet

def generate_key():
    # key generation
    key = Fernet.generate_key()
 
    # string the key in a file
    with open('filekey.key', 'wb') as filekey:
        filekey.write(key)

def encrypt_file(file_name):
    # opening the key
    with open('filekey.key', 'rb') as filekey:
        key = filekey.read()
 
    # using the generated key
    fernet = Fernet(key)
 
    # opening the original file to encrypt
    with open(file_name, 'rb') as file:
        original = file.read()
     
    # encrypting the file
    encrypted = fernet.encrypt(original)
 
    # opening the file in write mode and
    # writing the encrypted data
    with open("encrypted.bin", 'wb') as encrypted_file:
        encrypted_file.write(encrypted)

def decrypt_file(file_name):
    print("Decrypting file")
    # opening the key
    with open('filekey.key', 'rb') as filekey:
        key = filekey.read()
 
    # using the generated key
    fernet = Fernet(key)
 
    # opening the encrypted file
    with open("encrypted.bin", 'rb') as enc_file:
        encrypted = enc_file.read()
 
    # decrypting the file
    decrypted = fernet.decrypt(encrypted)
 
    # opening the file in write mode and
    # writing the decrypted data
    with open(file_name, 'wb') as dec_file:
        dec_file.write(decrypted)


#Main function
def main():
    parser = argparse.ArgumentParser(description='Encrypt and Decrypt files')
    parser.add_argument('-g', '--generate', help='Generate keys', action='store_true')
    parser.add_argument('-e', '--encrypt', help='Encrypt a file', type=str)
    parser.add_argument('-d', '--decrypt', help='Decrypt a file', type=str)
    args = parser.parse_args()
    if args.generate:
        generate_key()
    if args.encrypt:
        encrypt_file(args.encrypt)
    if args.decrypt:
        decrypt_file(args.decrypt)

if __name__ == '__main__':
    main()