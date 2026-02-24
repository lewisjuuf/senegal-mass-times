import requests
import json

API_URL = "http://localhost:8000"

# Real Catholic parishes in Dakar, Senegal
dakar_parishes = [
    {
        "name": "Cathédrale du Souvenir Africain",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Plateau",
        "address": "Avenue de la République, Plateau",
        "latitude": 14.6937,
        "longitude": -17.4441,
        "phone": "+221 33 821 23 45",
        "email": "cathedrale@dakar.sn",
        "admin_email": "admin@cathedrale-dakar.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "07:00:00", "language": "French", "mass_type": "Early Mass"},
            {"day_of_week": "Sunday", "time": "09:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "11:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Monday", "time": "07:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Tuesday", "time": "07:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Wednesday", "time": "07:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Thursday", "time": "07:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Friday", "time": "07:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-Joseph de Médina",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Médina",
        "address": "Rue 15, Médina",
        "latitude": 14.6928,
        "longitude": -17.4467,
        "phone": "+221 33 821 45 67",
        "email": "stjoseph@medina.sn",
        "admin_email": "admin@stjoseph-medina.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "18:30:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Wednesday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Friday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Sainte-Thérèse de l'Enfant Jésus",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Ouakam",
        "address": "Ouakam, près de la Mosquée de la Divinité",
        "latitude": 14.7167,
        "longitude": -17.4833,
        "phone": "+221 33 820 11 22",
        "email": "sainte.therese@ouakam.sn",
        "admin_email": "admin@sainte-therese-ouakam.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "07:30:00", "language": "French", "mass_type": "Early Mass"},
            {"day_of_week": "Sunday", "time": "09:30:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "11:30:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Thursday", "time": "18:30:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:30:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Sacré-Coeur de Mermoz",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Mermoz",
        "address": "Mermoz Pyrotechnie",
        "latitude": 14.7200,
        "longitude": -17.4600,
        "phone": "+221 33 824 56 78",
        "email": "sacrecoeur@mermoz.sn",
        "admin_email": "admin@sacrecoeur-mermoz.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "French", "mass_type": "Early Mass"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "12:00:00", "language": "English", "mass_type": "Mass in English"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Tuesday", "time": "18:30:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Friday", "time": "18:30:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-Charles Lwanga",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Sicap Liberté",
        "address": "Sicap Liberté 6",
        "latitude": 14.7300,
        "longitude": -17.4550,
        "phone": "+221 33 825 34 56",
        "email": "stcharles@sicap.sn",
        "admin_email": "admin@stcharles-sicap.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "07:30:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "09:30:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "11:30:00", "language": "Serer", "mass_type": "Mass in Serer"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Wednesday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Notre-Dame des Apôtres",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "HLM Grand Yoff",
        "address": "HLM Grand Yoff",
        "latitude": 14.7450,
        "longitude": -17.4650,
        "phone": "+221 33 827 89 01",
        "email": "notredame@hlm.sn",
        "admin_email": "admin@notredame-hlm.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "French", "mass_type": "Early Mass"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Thursday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-François Xavier de Ngor",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Ngor",
        "address": "Village de Ngor",
        "latitude": 14.7500,
        "longitude": -17.5100,
        "phone": "+221 33 820 45 67",
        "email": "stfrancois@ngor.sn",
        "admin_email": "admin@stfrancois-ngor.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "09:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "11:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-Augustin de Fann",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Fann Résidence",
        "address": "Fann Résidence",
        "latitude": 14.7050,
        "longitude": -17.4700,
        "phone": "+221 33 824 12 34",
        "email": "staugustin@fann.sn",
        "admin_email": "admin@staugustin-fann.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:30:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "10:30:00", "language": "French", "mass_type": "Family Mass"},
            {"day_of_week": "Sunday", "time": "18:30:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Tuesday", "time": "18:30:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Friday", "time": "18:30:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:30:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Notre-Dame de Lourdes",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Point E",
        "address": "Point E",
        "latitude": 14.7100,
        "longitude": -17.4500,
        "phone": "+221 33 825 67 89",
        "email": "lourdes@pointe.sn",
        "admin_email": "admin@lourdes-pointe.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "French", "mass_type": "Early Mass"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "11:30:00", "language": "Portuguese", "mass_type": "Mass in Portuguese"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Wednesday", "time": "18:30:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-Michel de Parcelles Assainies",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Parcelles Assainies",
        "address": "Parcelles Assainies Unité 15",
        "latitude": 14.7650,
        "longitude": -17.4400,
        "phone": "+221 33 835 12 34",
        "email": "stmichel@parcelles.sn",
        "admin_email": "admin@stmichel-parcelles.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "07:30:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "09:30:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "17:30:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Friday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-Pierre de Hann",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Hann Maristes",
        "address": "Hann Maristes",
        "latitude": 14.7380,
        "longitude": -17.4320,
        "phone": "+221 33 832 45 67",
        "email": "stpierre@hann.sn",
        "admin_email": "admin@stpierre-hann.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "French", "mass_type": "Early Mass"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Wednesday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Christ Roi de Yoff",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Yoff",
        "address": "Yoff Layenne",
        "latitude": 14.7520,
        "longitude": -17.4900,
        "phone": "+221 33 820 78 90",
        "email": "christroi@yoff.sn",
        "admin_email": "admin@christroi-yoff.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-Paul de Grand Dakar",
        "diocese_id": 1,
        "city": "Dakar",
        "region": "Grand Dakar",
        "address": "Grand Dakar",
        "latitude": 14.7180,
        "longitude": -17.4420,
        "phone": "+221 33 834 56 78",
        "email": "stpaul@granddakar.sn",
        "admin_email": "admin@stpaul-granddakar.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "07:30:00", "language": "French", "mass_type": "Early Mass"},
            {"day_of_week": "Sunday", "time": "09:30:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "11:30:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Thursday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Sainte-Jeanne d'Arc de Pikine",
        "diocese_id": 1,
        "city": "Pikine",
        "region": "Pikine",
        "address": "Pikine Guinaw Rails",
        "latitude": 14.7550,
        "longitude": -17.3950,
        "phone": "+221 33 836 12 34",
        "email": "stjeannedarc@pikine.sn",
        "admin_email": "admin@stjeannedarc-pikine.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "17:30:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
    {
        "name": "Paroisse Saint-François d'Assise de Guédiawaye",
        "diocese_id": 1,
        "city": "Guédiawaye",
        "region": "Guédiawaye",
        "address": "Guédiawaye Ndiarème Limamoulaye",
        "latitude": 14.7700,
        "longitude": -17.4100,
        "phone": "+221 33 837 89 01",
        "email": "stfrancois@guediawaye.sn",
        "admin_email": "admin@stfrancois-guediawaye.sn",
        "admin_password": "password123",
        "mass_times": [
            {"day_of_week": "Sunday", "time": "08:00:00", "language": "Wolof", "mass_type": "Mass in Wolof"},
            {"day_of_week": "Sunday", "time": "10:00:00", "language": "French", "mass_type": "Main Mass"},
            {"day_of_week": "Sunday", "time": "18:00:00", "language": "French", "mass_type": "Evening Mass"},
            {"day_of_week": "Friday", "time": "18:00:00", "language": "French", "mass_type": "Weekday Mass"},
            {"day_of_week": "Saturday", "time": "18:00:00", "language": "French", "mass_type": "Vigil Mass"},
        ]
    },
]

def add_parishes():
    print(f"🚀 Adding {len(dakar_parishes)} parishes from Dakar...\n")
    
    success_count = 0
    failed_count = 0
    
    for parish_data in dakar_parishes:
        # Extract mass times
        mass_times = parish_data.pop("mass_times", [])
        admin_email = parish_data["admin_email"]
        admin_password = parish_data["admin_password"]
        
        # Create parish
        try:
            response = requests.post(f"{API_URL}/parishes", json=parish_data)
            
            if response.status_code == 201:
                parish = response.json()
                parish_id = parish["id"]
                print(f"✅ Created: {parish['name']}")
                print(f"   📍 Location: {parish['region']}, {parish['city']}")
                print(f"   🆔 ID: {parish_id}")
                
                # Add mass times
                mass_success = 0
                for mass_time in mass_times:
                    mass_response = requests.post(
                        f"{API_URL}/parishes/{parish_id}/mass-times",
                        json=mass_time,
                        auth=(admin_email, admin_password)
                    )
                    if mass_response.status_code == 200:
                        mass_success += 1
                
                print(f"   🕐 Added {mass_success}/{len(mass_times)} mass times")
                print()
                success_count += 1
            else:
                print(f"❌ Failed: {parish_data['name']}")
                print(f"   Error: {response.text}")
                print()
                failed_count += 1
        except Exception as e:
            print(f"❌ Error creating {parish_data['name']}: {str(e)}")
            print()
            failed_count += 1
    
    print("=" * 60)
    print(f"✅ Successfully added: {success_count} parishes")
    if failed_count > 0:
        print(f"❌ Failed: {failed_count} parishes")
    print("=" * 60)

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  DAKAR CATHOLIC PARISHES - BULK IMPORT")
    print("=" * 60 + "\n")
    
    # Check if server is running
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            print("✅ Server is running\n")
            add_parishes()
        else:
            print("❌ Server returned an error")
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to server!")
        print("   Make sure the backend is running:")
        print("   cd backend && python backend_api.py")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")