import sys
import json
import time
from pocketoptionapi.stable_api import PocketOption

def main():
    try:
        # Read JSON input from stdin (sent by the Node.js backend)
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"success": False, "message": "No input provided"}))
            return
            
        data = json.loads(input_data)
        ssid = data.get("ssid")
        action = data.get("action")
        
        if not ssid:
            print(json.dumps({"success": False, "message": "SSID is required"}))
            return

        # Initialize PocketOption
        account = PocketOption(ssid)
        check, message = account.connect()
        
        if not check:
            print(json.dumps({"success": False, "message": f"Connection failed: {message}"}))
            return
            
        if action == "connect":
            balance = account.get_balance()
            print(json.dumps({
                "success": True, 
                "message": "Connected successfully",
                "balance": balance
            }))
            
        elif action == "trade":
            account_type = data.get("accountType", "PRACTICE")
            account.change_balance(account_type)
            
            asset = data.get("asset", "EURUSD")
            amount = data.get("amount", 1)
            direction = data.get("dir", "call")
            duration = data.get("duration", 30)
            
            # Execute Trade
            buy_info = account.buy(asset, amount, direction, duration)
            
            # Check Result
            win_result = account.check_win(buy_info["id"])
            new_balance = account.get_balance()
            
            print(json.dumps({
                "success": True, 
                "trade": buy_info,
                "win": win_result,
                "balance": new_balance
            }))
            
        elif action == "sell_option":
            buy_id = data.get("buy_id")
            if buy_id:
                account.sell_option(buy_id)
                print(json.dumps({"success": True, "message": f"Option {buy_id} sold"}))
            else:
                print(json.dumps({"success": False, "message": "buy_id is required"}))
                
        elif action == "get_candle":
            asset = data.get("asset", "EURUSD")
            offset = data.get("offset", 120)
            period = data.get("period", 60)
            _time = int(time.time())
            candle = account.get_candle(asset, _time, offset, period)
            print(json.dumps({"success": True, "data": candle}))
            
        elif action == "check_asset_open":
            asset = data.get("asset", "EURUSD")
            is_open = account.check_asset_open(asset)
            print(json.dumps({"success": True, "asset": asset, "is_open": is_open}))
            
        elif action == "get_realtime_candle":
            asset = data.get("asset", "EURUSD")
            list_size = data.get("list_size", 10)
            account.start_candles_stream(asset, list_size)
            while True:
                if len(account.get_realtime_candles(asset)) == list_size:
                    break
            candles = account.get_realtime_candles(asset)
            print(json.dumps({"success": True, "data": candles}))
            
        elif action == "get_payment":
            all_data = account.get_payment()
            print(json.dumps({"success": True, "data": all_data}))
            
        # Close connection
        account.close()
        
    except Exception as e:
        print(json.dumps({"success": False, "message": str(e)}))

if __name__ == "__main__":
    main()
