import pyotp
import time
import qrcode

key = pyotp.random_base32()

#Obter info do name apartir do issuer pelo URL
uri = pyotp.totp.TOTP(key).provisioning_uri(name="", 
                                            issuer_name="Transcendence")
qrcode.make(uri).save("qrcode_test.png")