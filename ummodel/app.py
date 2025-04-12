from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)  # ✅ 启用 CORS

# 加载模型
model = joblib.load("recommendation_model.pkl")

required_features = [
    'family_size', 'total_income', 'requested_amount',
    'total_received_amount', 'request_receive_ratio', 'is_OKU'
]

@app.route('/')
def home():
    return "✅ Flask API is running."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.get_json()
        print("📥 Received data:", input_data)  # 👈 打印前端传过来的内容

        if isinstance(input_data, dict):
            input_data = [input_data]

        for item in input_data:
            total_received = max(item.get('total_received_amount', 1), 1)
            item['request_receive_ratio'] = item['requested_amount'] / total_received

        df = pd.DataFrame(input_data)
        print("📊 DataFrame before prediction:\n", df)

        for col in required_features:
            if col not in df.columns:
                print("❌ Missing column:", col)
                return jsonify({"error": f"Missing column: {col}"}), 400

        predictions = model.predict(df[required_features])
        df['predicted_class'] = predictions

        result = df[['name', 'predicted_class']]
        result = result.sort_values(by='predicted_class', ascending=False)

        return jsonify(result.to_dict(orient='records'))

    except Exception as e:
        print("🔥 Internal Server Error:", str(e))  # 👈 打印错误信息
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
